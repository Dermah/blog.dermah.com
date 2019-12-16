const markdownIt = require("markdown-it");
const mdRender = new markdownIt({});

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    "html",
    "liquid",
    "ejs",
    "md",
    "hbs",
    "mustache",
    "haml",
    "pug",
    "njk",
    "11ty.js",
    "css"
  ]);

  eleventyConfig.setFrontMatterParsingOptions({
    // Define excerpts before the "---" in files
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
    excerpt_alias: "excerpt"
  });

  eleventyConfig.addFilter("renderUsingMarkdown", function(rawString) {
    if (!rawString) {
      throw new Error(
        "Post did not have an `excerpt`. Define it in front matter or use the `<!-- excerpt -->` comment to define the exceprt in the post."
      );
    }
    return mdRender.render(rawString);
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
