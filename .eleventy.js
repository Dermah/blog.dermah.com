const markdownIt = require("markdown-it");
const mdRender = new markdownIt({});
module.exports = function(eleventyConfig) {
  eleventyConfig.setFrontMatterParsingOptions({
    // Define excerpts before the "---" in files
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
    excerpt_alias: "excerpt"
  });

  eleventyConfig.addFilter("renderUsingMarkdown", function(rawString) {
    return mdRender.render(rawString);
  });

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
