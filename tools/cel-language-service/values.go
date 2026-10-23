package main

import (
	"fmt"
	"reflect"

	"cel.dev/cel-go/common/types"
	"cel.dev/cel-go/common/types/ref"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protoreflect"
)

// Catalog objects intentionally use missing-field semantics, not protobuf's scalar defaults.
// The descriptors are type declarations; the adapter preserves provider-body absence.
type objectAdapter struct{}

func (a objectAdapter) NativeToValue(value interface{}) ref.Val {
	if m, ok := value.(proto.Message); ok {
		return &objectValue{m: m.ProtoReflect()}
	}
	return types.DefaultTypeAdapter.NativeToValue(value)
}

type presenceProvider struct{ types.Provider }

func (p presenceProvider) FindStructFieldType(name, field string) (*types.FieldType, bool) {
	f, ok := p.Provider.FindStructFieldType(name, field)
	if !ok {
		return nil, false
	}
	return &types.FieldType{Type: f.Type}, true
}

type objectValue struct{ m protoreflect.Message }

func (o *objectValue) Type() ref.Type {
	return types.NewObjectType(string(o.m.Descriptor().FullName()))
}
func (o *objectValue) Value() interface{} { return o.m.Interface() }
func (o *objectValue) ConvertToNative(t reflect.Type) (interface{}, error) {
	if reflect.TypeOf(o.m.Interface()).AssignableTo(t) {
		return o.m.Interface(), nil
	}
	return nil, fmt.Errorf("catalog object cannot convert to %s", t)
}
func (o *objectValue) ConvertToType(t ref.Type) ref.Val {
	if t.TypeName() == o.Type().TypeName() {
		return o
	}
	if t == types.TypeType {
		return types.NewObjectType(string(o.m.Descriptor().FullName()))
	}
	return types.NewErr("catalog object cannot convert to %s", t.TypeName())
}
func (o *objectValue) Equal(v ref.Val) ref.Val {
	other, ok := v.(*objectValue)
	if !ok {
		return types.MaybeNoSuchOverloadErr(v)
	}
	return types.Bool(proto.Equal(o.m.Interface(), other.m.Interface()))
}
func (o *objectValue) IsSet(v ref.Val) ref.Val {
	name, ok := v.(types.String)
	if !ok {
		return types.MaybeNoSuchOverloadErr(v)
	}
	fd := o.m.Descriptor().Fields().ByName(protoreflect.Name(name))
	if fd == nil {
		return types.NewErr("unknown catalog field %s", name)
	}
	return types.Bool(fd.IsList() || fd.IsMap() || o.m.Has(fd))
}
func (o *objectValue) Get(v ref.Val) ref.Val {
	name, ok := v.(types.String)
	if !ok {
		return types.MaybeNoSuchOverloadErr(v)
	}
	fd := o.m.Descriptor().Fields().ByName(protoreflect.Name(name))
	if fd == nil {
		return types.NewErr("unknown catalog field %s", name)
	}
	if !fd.IsMap() && !fd.IsList() && !o.m.Has(fd) {
		return types.NewErr("absent optional field %s; guard with has(...) before reading", name)
	}
	value := o.m.Get(fd)
	if fd.IsMap() {
		values := map[string]string{}
		value.Map().Range(func(k protoreflect.MapKey, v protoreflect.Value) bool { values[k.String()] = v.String(); return true })
		return types.NewStringStringMap(objectAdapter{}, values)
	}
	if fd.IsList() {
		xs := value.List()
		values := make([]ref.Val, xs.Len())
		for i := range xs.Len() {
			values[i] = fieldValue(fd, xs.Get(i))
		}
		return types.NewRefValList(objectAdapter{}, values)
	}
	return fieldValue(fd, value)
}
func fieldValue(fd protoreflect.FieldDescriptor, v protoreflect.Value) ref.Val {
	switch fd.Kind() {
	case protoreflect.MessageKind:
		return &objectValue{m: v.Message()}
	case protoreflect.StringKind:
		return types.String(v.String())
	case protoreflect.Int64Kind:
		return types.Int(v.Int())
	case protoreflect.BoolKind:
		return types.Bool(v.Bool())
	default:
		return types.NewErr("unsupported catalog scalar %s", fd.Kind())
	}
}
