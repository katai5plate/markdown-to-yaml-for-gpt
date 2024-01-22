import fs from "fs";
import path from "path";
import yaml from "yaml";

const [_, __, filename] = process.argv;

const md = fs.readFileSync(filename, { encoding: "utf8" });

function parseMarkdownToJSON(markdown) {
  const lines = markdown.split("\n");
  const root = [];
  const stack = [{ level: 0, content: root }];

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,6}) (.*)/);
    const listItemMatch = line.match(/^[-*] (.*)/);
    const orderedListItemMatch = line.match(/^\d+\. (.*)/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      while (stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      const newEntry = { [text]: [] };
      stack[stack.length - 1].content.push(newEntry);
      stack.push({ level, content: newEntry[text] });
    } else if (listItemMatch || orderedListItemMatch) {
      const text = (listItemMatch || orderedListItemMatch)[1];
      stack[stack.length - 1].content.push(text);
    } else if (line.trim() !== "") {
      stack[stack.length - 1].content.push(line);
    }
  });

  return root.length === 1 ? root[0] : root;
}

const result = parseMarkdownToJSON(md);
console.log(result);
fs.writeFileSync(path.parse(filename).name + ".yaml", yaml.stringify(result));
