// @ts-check
// @ts-ignore
const asciidoctor = /** @type {import('@asciidoctor/core').Asciidoctor} */(require('@asciidoctor/core')());
const Block = require('./htmlParser.cjs');
const path = require('path');
const fs = require('fs');

function compileAsciiDocuments() {
  const baseDir = path.join(__dirname, '../src/asciiDoc');
  const files = fs.readdirSync(baseDir);
  for (const file of files) {
    if (file.endsWith('.adoc')) {
      const outputContent = asciidoctor.convert(fs.readFileSync(path.join(baseDir, file)).toString()).toString();
      const htmlDocument = new Block(outputContent);
      const bodyNode = htmlDocument.querySelector('body');
      const tocNode = bodyNode?.querySelector('#toc');
      if (tocNode && bodyNode) {
        if ('childNodes' in bodyNode.document) {
          bodyNode?.document.childNodes.splice(bodyNode.document.childNodes.indexOf(/** @type {any} */(tocNode.document)), 1);
        }
      }
      const tocContent = tocNode?.serialize() ?? '';
      const restContent = (bodyNode?.serialize() ?? '').replace(/<body[^>]*>/, '').replace(/<\/body>/, '').trim();
      const tocOutputFile = path.join(baseDir, file.replace('.adoc', '.toc.astro'));
      const restOutputFile = path.join(baseDir, file.replace('.adoc', '.astro'));
      fs.writeFileSync(tocOutputFile, `---\n---\n${tocContent}\n`);
      fs.writeFileSync(restOutputFile, `---\n---\n${restContent}\n`);
    }
  }
}

compileAsciiDocuments();