package main

import (
	"fmt"
	"sort"
	"strconv"
	"strings"

	"cel.dev/cel-go/cel"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/dynamicpb"
)

type Field struct {
	Name, Type, Description string
	Repeated, Map, Optional bool
}
type Definition struct {
	Name   string
	Fields []Field
}
type Parameter struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Value       string `json:"value"`
	Description string `json:"description"`
}
type Example struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Expression  string `json:"expression"`
	Description string `json:"description"`
}
type FixtureSummary struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Provider string `json:"provider"`
	Resource string `json:"resource"`
}
type SchemaField struct {
	Path        string `json:"path"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Optional    bool   `json:"optional"`
}
type ProfileInfo struct {
	ID             string           `json:"id"`
	Label          string           `json:"label"`
	Description    string           `json:"description"`
	NumericProfile string           `json:"numericProfile"`
	Fixtures       []FixtureSummary `json:"fixtures"`
	Examples       []Example        `json:"examples"`
	Parameters     []Parameter      `json:"parameters"`
	Fields         []SchemaField    `json:"fields"`
}
type Fixture struct {
	Summary FixtureSummary
	JSON    string
	Value   proto.Message
}
type Profile struct {
	Info       ProfileInfo
	Root       string
	Fixtures   []Fixture
	Env        *cel.Env
	Descriptor protoreflect.MessageDescriptor
}
type Catalog struct {
	Definitions map[string]Definition
	Profiles    map[string]*Profile
}

const numericProfile = "Development integer-only CEL: exact signed int64 fields/parameters; double literals and double() conversion are unsupported. Upstream mixed-double numeric correctness is unresolved; this is not the production numeric policy. Optional fields preserve absence; no nullable/union schema claims."

func scalar(name, typ, doc string) Field { return Field{Name: name, Type: typ, Description: doc} }
func list(name, typ, doc string) Field {
	return Field{Name: name, Type: typ, Description: doc, Repeated: true}
}
func mapping(name, doc string) Field {
	return Field{Name: name, Type: "string", Description: doc, Map: true}
}
func optional(name, typ, doc string) Field {
	return Field{Name: name, Type: typ, Description: doc, Optional: true}
}
func newCatalog() (*Catalog, error) {
	defs := []Definition{
		{"Metadata", []Field{scalar("name", "string", "Provider resource name."), scalar("namespace", "string", "Namespace of this fixture."), scalar("generation", "int64", "Exact observed generation; no JavaScript numeric conversion."), mapping("labels", "Arbitrary string keys; observed keys are bounded fixture observations.")}},
		{"Port", []Field{scalar("name", "string", "Named container port."), scalar("containerPort", "int64", "Container port number.")}},
		{"ContainerResources", []Field{mapping("requests", "Native Kubernetes resource quantities such as cpu=500m, retained as strings; no quantity parser is claimed.")}},
		{"Container", []Field{scalar("name", "string", "Container name; correlate predicates within one exists variable."), scalar("image", "string", "Container image reference."), list("ports", "Port", "Declared container ports."), scalar("resources", "ContainerResources", "Native Kubernetes container resource requests; quantity values are strings.")}},
		{"PodSpec", []Field{list("containers", "Container", "Containers; exists/all preserve same-element correlation."), scalar("nodeName", "string", "Assigned node.")}},
		{"PodCondition", []Field{scalar("type", "string", "Native Pod condition type, such as Ready."), scalar("status", "string", "Native Pod condition status string: True, False, or Unknown; not a boolean.")}},
		{"PodStatus", []Field{scalar("phase", "string", "Pod lifecycle phase."), optional("podIP", "string", "Optional IP; use has(resource.status.podIP) before reading absent values."), list("conditions", "PodCondition", "Native Pod status conditions; correlate type/status in the same condition.")}},
		{"Pod", []Field{scalar("metadata", "Metadata", "Resource identity and arbitrary labels."), scalar("spec", "PodSpec", "Pod desired specification."), scalar("status", "PodStatus", "Observed Pod state.")}},
		{"Tag", []Field{scalar("key", "string", "Tag key."), scalar("value", "string", "Tag value; correlate key/value in one tag element.")}},
		{"CloudInstance", []Field{scalar("name", "string", "Cloud instance name."), scalar("region", "string", "Provider region."), scalar("cpuCount", "int64", "Virtual CPUs."), scalar("state", "string", "Lifecycle state."), scalar("generation", "int64", "Exact generation, including values beyond 2^53."), list("tags", "Tag", "Provider tag collection."), optional("publicIP", "string", "Optional public address.")}},
		{"Hardware", []Field{scalar("cpu", "int64", "Configured virtual CPU count."), scalar("memoryBytes", "int64", "Configured memory in bytes.")}},
		{"VirtualMachine", []Field{scalar("name", "string", "VM name."), scalar("powerState", "string", "Observed power state."), scalar("hardware", "Hardware", "Provider-neutral VM hardware."), mapping("labels", "Arbitrary VM labels."), optional("guestIP", "string", "Optional guest-reported address.")}},
	}
	c := &Catalog{Definitions: map[string]Definition{}, Profiles: map[string]*Profile{}}
	file := &descriptorpb.FileDescriptorProto{Name: proto.String("omniview_development_catalog.proto"), Package: proto.String("omniview.dev"), Syntax: proto.String("proto2")}
	for _, d := range defs {
		c.Definitions[d.Name] = d
		m := &descriptorpb.DescriptorProto{Name: proto.String(d.Name)}
		for i, f := range d.Fields {
			fd := &descriptorpb.FieldDescriptorProto{Name: proto.String(f.Name), JsonName: proto.String(f.Name), Number: proto.Int32(int32(i + 1)), Label: descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum()}
			switch f.Type {
			case "string":
				fd.Type = descriptorpb.FieldDescriptorProto_TYPE_STRING.Enum()
			case "int64":
				fd.Type = descriptorpb.FieldDescriptorProto_TYPE_INT64.Enum()
			case "bool":
				fd.Type = descriptorpb.FieldDescriptorProto_TYPE_BOOL.Enum()
			default:
				fd.Type = descriptorpb.FieldDescriptorProto_TYPE_MESSAGE.Enum()
				fd.TypeName = proto.String(".omniview.dev." + f.Type)
			}
			if f.Repeated {
				fd.Label = descriptorpb.FieldDescriptorProto_LABEL_REPEATED.Enum()
			}
			if f.Map {
				entryName := strings.ToUpper(f.Name[:1]) + f.Name[1:] + "Entry"
				m.NestedType = append(m.NestedType, &descriptorpb.DescriptorProto{Name: proto.String(entryName), Options: &descriptorpb.MessageOptions{MapEntry: proto.Bool(true)}, Field: []*descriptorpb.FieldDescriptorProto{{Name: proto.String("key"), Number: proto.Int32(1), Label: descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(), Type: descriptorpb.FieldDescriptorProto_TYPE_STRING.Enum()}, {Name: proto.String("value"), Number: proto.Int32(2), Label: descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(), Type: descriptorpb.FieldDescriptorProto_TYPE_STRING.Enum()}}})
				fd.Type = descriptorpb.FieldDescriptorProto_TYPE_MESSAGE.Enum()
				fd.TypeName = proto.String(".omniview.dev." + d.Name + "." + entryName)
				fd.Label = descriptorpb.FieldDescriptorProto_LABEL_REPEATED.Enum()
			}
			m.Field = append(m.Field, fd)
		}
		file.MessageType = append(file.MessageType, m)
	}
	descriptor, err := protodesc.NewFile(file, nil)
	if err != nil {
		return nil, err
	}
	parameters := []Parameter{{"minimumCpu", "int64", "4", "Minimum CPU count for cloud and VM examples."}, {"minimumPort", "int64", "1000", "Typed container port threshold for the Pod integer example."}, {"imagePrefix", "string", "nginx:", "Image prefix parameter, bound as data."}, {"desiredPhase", "string", "Running", "Desired Pod lifecycle phase."}}
	pod := &Profile{Root: "Pod", Info: ProfileInfo{ID: "pod", Label: "Kubernetes Pods", Description: "Three complete development representations of the declared Pod schema subset: native labels, containers/resources/ports, conditions and optional IP. Not the full Kubernetes API schema.", Parameters: parameters}, Fixtures: []Fixture{
		{Summary: FixtureSummary{"pod-web", "frontend-web", "kubernetes", "Pod"}, JSON: `{"metadata":{"name":"frontend-web","namespace":"production","generation":"7","labels":{"app.kubernetes.io/name":"frontend","env":"prod","team":"platform","quote\"key":"safe"}},"spec":{"nodeName":"node-a","containers":[{"name":"web","image":"nginx:1.27","resources":{"requests":{"cpu":"500m","memory":"128Mi"}},"ports":[{"name":"http","containerPort":"8080"}]},{"name":"metrics","image":"prom/stats:2","resources":{"requests":{"cpu":"100m"}},"ports":[{"name":"metrics","containerPort":"9090"}]}]},"status":{"phase":"Running","podIP":"10.0.0.1","conditions":[{"type":"Ready","status":"True"}]}}`},
		{Summary: FixtureSummary{"pod-pending", "batch-pending", "kubernetes", "Pod"}, JSON: `{"metadata":{"name":"batch-pending","namespace":"jobs","generation":"2","labels":{"app.kubernetes.io/name":"batch","env":"dev"}},"spec":{"nodeName":"","containers":[{"name":"batch","image":"python:3.13","resources":{"requests":{"cpu":"2"}},"ports":[]}]},"status":{"phase":"Pending","conditions":[{"type":"Ready","status":"False"}]}}`},
		{Summary: FixtureSummary{"pod-worker", "queue-worker", "kubernetes", "Pod"}, JSON: `{"metadata":{"name":"queue-worker","namespace":"production","generation":"9","labels":{"app.kubernetes.io/name":"worker","env":"prod"}},"spec":{"nodeName":"node-b","containers":[{"name":"worker","image":"worker:4","resources":{"requests":{"cpu":"1500m"}},"ports":[]}]},"status":{"phase":"Running","podIP":"10.0.0.3","conditions":[{"type":"Ready","status":"True"}]}}`},
	}}
	pod.Info.Examples = []Example{
		{"running", "Running Pods", `resource.status.phase == desiredPhase`, "Typed string parameter and native lifecycle field."},
		{"labels", "Production frontend", `resource.metadata.labels["app.kubernetes.io/name"] == "frontend" && resource.metadata.labels["env"] == "prod"`, "Arbitrary map keys, including a key containing punctuation."},
		{"images", "Matching web image", `resource.spec.containers.exists(c, c.name == "web" && c.image.startsWith(imagePrefix))`, "Real CEL macro-local variable and string receiver function."},
		{"ports", "Correlated HTTP port", `resource.spec.containers.exists(c, c.name == "web" && c.ports.exists(p, p.name == "http" && p.containerPort == 8080))`, "Nested macro scope; no cross-container correlation."},
		{"port-threshold", "Port above typed threshold", `resource.spec.containers.exists(c, c.ports.exists(p, p.containerPort >= minimumPort))`, "Exact typed integer variable compared with a native containerPort field."},
		{"cpu-quantity", "Exact CPU request quantity", `resource.spec.containers.exists(c, c.resources.requests["cpu"] == "500m")`, "Native Kubernetes quantity string equality only; not numeric quantity normalization or comparison."},
		{"presence", "IP present and ready", `has(resource.status.podIP) && resource.status.conditions.exists(c, c.type == "Ready" && c.status == "True")`, "Native condition strings, same-condition correlation, and optional IP presence."},
	}
	cloud := &Profile{Root: "CloudInstance", Info: ProfileInfo{ID: "cloud", Label: "Cloud instances", Description: "Provider-neutral instance schema with correlated tag arrays and exact generations.", Parameters: parameters}, Fixtures: []Fixture{{Summary: FixtureSummary{"cloud-api", "api-prod", "cloud", "Instance"}, JSON: `{"name":"api-prod","region":"eu-west-1","cpuCount":"8","state":"running","generation":"9007199254740993","tags":[{"key":"env","value":"prod"},{"key":"team","value":"platform"}],"publicIP":"203.0.113.10"}`}, {Summary: FixtureSummary{"cloud-dev", "api-dev", "cloud", "Instance"}, JSON: `{"name":"api-dev","region":"us-east-1","cpuCount":"2","state":"stopped","generation":"9007199254740992","tags":[{"key":"env","value":"dev"},{"key":"other","value":"prod"}]}`}}}
	cloud.Info.Examples = []Example{{"cloud-tags", "Production compute", `resource.cpuCount >= minimumCpu && resource.tags.exists(t, t.key == "env" && t.value == "prod")`, "Same-tag correlation and typed minimumCpu parameter."}, {"cloud-generation", "Exact generation", `resource.generation == 9007199254740993`, "Exact int64 beyond JavaScript's safe integer range; never transported as a JS number."}, {"cloud-presence", "Public address", `has(resource.publicIP) && resource.state == "running"`, "Optional field presence."}}
	vm := &Profile{Root: "VirtualMachine", Info: ProfileInfo{ID: "vm", Label: "Virtual machines", Description: "Provider-neutral VM schema with hardware object and arbitrary labels.", Parameters: parameters}, Fixtures: []Fixture{{Summary: FixtureSummary{"vm-build", "build-agent", "hypervisor", "VirtualMachine"}, JSON: `{"name":"build-agent","powerState":"running","hardware":{"cpu":"8","memoryBytes":"17179869184"},"labels":{"pool":"ci","env":"prod"},"guestIP":"192.0.2.20"}`}, {Summary: FixtureSummary{"vm-idle", "idle-agent", "hypervisor", "VirtualMachine"}, JSON: `{"name":"idle-agent","powerState":"stopped","hardware":{"cpu":"2","memoryBytes":"4294967296"},"labels":{"pool":"ci","env":"dev"}}`}}}
	vm.Info.Examples = []Example{{"vm-compute", "Running build capacity", `resource.hardware.cpu >= minimumCpu && resource.powerState == "running"`, "Typed nested VM hardware without Kubernetes-specific assumptions."}, {"vm-labels", "CI machines", `resource.labels["pool"] == "ci"`, "Provider-neutral arbitrary labels."}, {"vm-guest", "Guest address available", `has(resource.guestIP)`, "Optional guest address presence."}}
	for _, p := range []*Profile{pod, cloud, vm} {
		p.Descriptor = descriptor.Messages().ByName(protoreflect.Name(p.Root))
		messages := []proto.Message{}
		for i := range descriptor.Messages().Len() {
			messages = append(messages, dynamicpb.NewMessage(descriptor.Messages().Get(i)))
		}
		opts := []cel.EnvOption{cel.Types(messagesToInterfaces(messages)...), cel.Variable("resource", cel.ObjectType("omniview.dev."+p.Root)), cel.ParserRecursionLimit(64), cel.ParserExpressionSizeLimit(8192), cel.CrossTypeNumericComparisons(false)}
		for _, param := range parameters {
			opts = append(opts, cel.Variable(param.Name, parameterType(param.Type)))
		}
		p.Env, err = cel.NewEnv(opts...)
		if err != nil {
			return nil, err
		}
		p.Env, err = p.Env.Extend(cel.CustomTypeProvider(presenceProvider{p.Env.CELTypeProvider()}), cel.CustomTypeAdapter(objectAdapter{}))
		if err != nil {
			return nil, err
		}
		for i := range p.Fixtures {
			m := dynamicpb.NewMessage(p.Descriptor)
			if err = protojson.Unmarshal([]byte(p.Fixtures[i].JSON), m); err != nil {
				return nil, err
			}
			if err = validateMessage(m.ProtoReflect(), 0); err != nil {
				return nil, err
			}
			p.Fixtures[i].Value = m
			p.Info.Fixtures = append(p.Info.Fixtures, p.Fixtures[i].Summary)
		}
		p.Info.NumericProfile = numericProfile
		p.Info.Fields = c.schemaFields(p.Root, "resource", 0)
		c.Profiles[p.Info.ID] = p
	}
	return c, nil
}

// cel.Types requires interface values; this bridge carries only protobuf messages, never JSON numbers.
func messagesToInterfaces(ms []proto.Message) []interface{} {
	out := make([]interface{}, len(ms))
	for i, m := range ms {
		out[i] = m
	}
	return out
}
func parameterType(t string) *cel.Type {
	switch t {
	case "int64":
		return cel.IntType
	case "bool":
		return cel.BoolType
	default:
		return cel.StringType
	}
}
func (c *Catalog) schemaFields(name, prefix string, depth int) []SchemaField {
	out := []SchemaField{}
	if depth > 8 {
		return out
	}
	for _, f := range c.Definitions[name].Fields {
		typ := f.Type
		if f.Repeated {
			typ = "list<" + typ + ">"
		}
		if f.Map {
			typ = "map<string, string>"
		}
		path := prefix + "." + f.Name
		out = append(out, SchemaField{path, typ, f.Description, f.Optional})
		if !f.Map && !f.Repeated {
			out = append(out, c.schemaFields(f.Type, path, depth+1)...)
		}
	}
	return out
}
func validateMessage(m protoreflect.Message, depth int) error {
	if depth > 16 {
		return fmt.Errorf("fixture depth limit")
	}
	fs := m.Descriptor().Fields()
	for i := 0; i < fs.Len(); i++ {
		f := fs.Get(i)
		if f.IsMap() {
			if m.Get(f).Map().Len() > 64 {
				return fmt.Errorf("fixture map cardinality")
			}
			continue
		}
		if f.IsList() {
			xs := m.Get(f).List()
			if xs.Len() > 64 {
				return fmt.Errorf("fixture list cardinality")
			}
			if f.Kind() == protoreflect.MessageKind {
				for j := 0; j < xs.Len(); j++ {
					if err := validateMessage(xs.Get(j).Message(), depth+1); err != nil {
						return err
					}
				}
			}
			continue
		}
		if f.Kind() == protoreflect.MessageKind {
			if !m.Has(f) {
				return fmt.Errorf("required fixture object %s absent", f.Name())
			}
			if err := validateMessage(m.Get(f).Message(), depth+1); err != nil {
				return err
			}
		}
	}
	return nil
}
func (p *Profile) bindings(f Fixture) map[string]interface{} {
	b := map[string]interface{}{"resource": f.Value}
	for _, v := range p.Info.Parameters {
		switch v.Type {
		case "int64":
			n, _ := strconv.ParseInt(v.Value, 10, 64)
			b[v.Name] = n
		case "bool":
			b[v.Name] = v.Value == "true"
		default:
			b[v.Name] = v.Value
		}
	}
	return b
}
func (c *Catalog) infos() []ProfileInfo {
	out := []ProfileInfo{}
	for _, id := range []string{"pod", "cloud", "vm"} {
		out = append(out, c.Profiles[id].Info)
	}
	return out
}
func sortedKeys[V interface{}](m map[string]V) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}
