#!/usr/bin/make -f

NODE   := /usr/bin/env node
ROLLUP := /usr/bin/env npx rollup

DSTDIR := dist

.PHONY: build
build: $(DSTDIR)/package.json $(DSTDIR)/README.md $(DSTDIR)/LICENSE $(DSTDIR)/index.js $(DSTDIR)/index.d.ts

$(DSTDIR)/package.json : package.json
	mkdir -p $(@D)
	$(NODE) -p "JSON.stringify([\"devDependencies\"].reduce((p,k)=>(delete p[k],p),require(\"./package.json\")))" > $@

$(DSTDIR)/README.md : README.md
	install -D $< $@

$(DSTDIR)/LICENSE : LICENSE
	install -D $< $@

$(DSTDIR)/index.js : index.js
	$(ROLLUP) -d $(@D) -p @ampproject/rollup-plugin-closure-compiler $<

$(DSTDIR)/index.d.ts : index.d.ts
	install -D $< $@

.PHONY: clean
clean:
	@rm -fr $(DSTDIR)
