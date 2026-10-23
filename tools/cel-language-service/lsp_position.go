package main

import (
	"fmt"
	"unicode/utf8"
)

type lspPosition struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}
type lspRange struct {
	Start lspPosition `json:"start"`
	End   lspPosition `json:"end"`
}

// LSP characters are negotiated code units; CEL ranges are UTF8 bytes. CRLF is
// one line ending and neither newline byte belongs to a line's character range.
func positionOffset(text string, p lspPosition, encoding string) (int, error) {
	if p.Line < 0 || p.Character < 0 {
		return 0, fmt.Errorf("negative position")
	}
	start := 0
	for range p.Line {
		found := false
		for start < len(text) {
			c := text[start]
			start++
			if c == '\r' {
				if start < len(text) && text[start] == '\n' {
					start++
				}
				found = true
				break
			}
			if c == '\n' {
				found = true
				break
			}
		}
		if !found {
			return 0, fmt.Errorf("line outside document")
		}
	}
	offset, units := start, 0
	for offset < len(text) && text[offset] != '\r' && text[offset] != '\n' {
		if units == p.Character {
			return offset, nil
		}
		r, n := utf8.DecodeRuneInString(text[offset:])
		width := n
		if encoding != "utf-8" {
			width = 1
			if r > 0xffff {
				width = 2
			}
		}
		if units+width > p.Character {
			return 0, fmt.Errorf("position splits encoded character")
		}
		units += width
		offset += n
	}
	return offset, nil // LSP positions past line end clamp to the line end.
}
func offsetPosition(text string, offset int, encoding string) lspPosition {
	offset = max(0, min(offset, len(text)))
	p := lspPosition{}
	for i := 0; i < offset; {
		if text[i] == '\r' {
			i++
			if i < len(text) && text[i] == '\n' {
				i++
			}
			p.Line++
			p.Character = 0
			continue
		}
		if text[i] == '\n' {
			i++
			p.Line++
			p.Character = 0
			continue
		}
		r, n := utf8.DecodeRuneInString(text[i:])
		if i+n > offset {
			break
		}
		i += n
		if encoding == "utf-8" {
			p.Character += n
		} else {
			p.Character++
			if r > 0xffff {
				p.Character++
			}
		}
	}
	return p
}
func wireRange(text string, r Range, encoding string) lspRange {
	return lspRange{offsetPosition(text, r.Start, encoding), offsetPosition(text, r.End, encoding)}
}
