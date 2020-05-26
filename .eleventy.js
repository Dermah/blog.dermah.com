const markdownIt = require("markdown-it");
const unescapeAll = require("markdown-it/lib/common/utils").unescapeAll;
const Convert = require("ansi-to-html");
const slugify = require('slugify');

const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  // Define custom markdown-it so we can shove some custom rendering in
  const mdRender = new markdownIt({
    html: true
  });

  // ### RENDER ANSI ESCAPE CODES IN `shell-session` OUTPUT USING SPANS

  const convert = new Convert({
    // use iTerm2 default colours
    colors: {
      "1": "#c91b00",
      "2": "#00c200",
      "3": "#c7c400",
      "4": "#0225c7",
      "5": "#c930c7",
      "6": "#00c5c7",
      "7": "#c7c7c7"
    }
  });

  // Remember old fence renderer, if overridden, or proxy to default renderer
  var defaultFenceRender =
    mdRender.renderer.rules.fence ||
    function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // Shoehorn ANSI colours into the `shell-session` fenced language
  mdRender.renderer.rules.fence = function(tokens, idx, options, env, self) {
    var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : "",
      langName = "";

    if (info) {
      langName = info.split(/\s+/g)[0];
    }

    if (langName !== "shell-session") {
      // pass token to default renderer.
      return defaultFenceRender(tokens, idx, options, env, self);
    }

    // get default output and mash some ansi spans in there
    let output = defaultFenceRender(tokens, idx, options, env, self);

    output = output.replace(
      // I hate this, doing it to increase CSS specifisity to style
      // the terminal code differently
      `<pre class="language-shell-session">`,
      `<pre class="language-shell-session terminal-box">`
    );
    return convert.toHtml(output);
  };

  // ### END ANSI RENDER JUNK

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

  // Define excerpts that are used in summaried throughout the blog
  // Use like: <!-- excerpt -->
  // and: {{post.data.excerpt | renderUsingMarkdown | safe}}
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
    excerpt_alias: "excerpt"
  });

  // Use the same markdown renderer everywhere in the blog
  // (.md files and in templates using the below filter)
  eleventyConfig.setLibrary("md", mdRender);

  // Render markdown strings in templates
  // Use like: {{post.data.excerpt | renderUsingMarkdown | safe}}
  eleventyConfig.addFilter("renderUsingMarkdown", function(rawString) {
    if (!rawString) {
      throw new Error(
        "Post did not have an `excerpt`. Define it in front matter or use the `<!-- excerpt -->` comment to define the exceprt in the post."
      );
    }
    return mdRender.render(rawString);
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  // All posts that aren't drafts from oldest first.
  // Use like: {%- assign posts = collections.allPublicPosts | reverse -%}
  eleventyConfig.addCollection("allPublicPosts", function(collection) {
    return collection.getAllSorted().filter(post => !post.data.draft);
  });

  // print to console filter
  // Use like: {{ page | console }}
  eleventyConfig.addFilter("console", function(rawString) {
    console.log(rawString);
  });

  // ffs I don't like special characters
  // Use like: {{ title | slug }}
  eleventyConfig.addFilter("slug", function(rawString) {
    return slugify(rawString, {
      replacement: "-",
      lower: true,
      strict: true
    });
  })

  // Copy `img/` to `_site/img`
  eleventyConfig.addPassthroughCopy("src/img");

  // oh holy crap all images in all directories will get dumped to `/img`
  // until 11ty/eleventy#379 is decided on, at which point this and all
  // posts will need refactoring allow images to stay in the same folder
  // as their post
  eleventyConfig.addPassthroughCopy({"src/_posts/**/*.jpg": "img"});

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
