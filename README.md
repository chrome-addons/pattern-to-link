# pattern-to-link
Find patterns in a page and create links for them as well as an overview container to jump to them

## Introduction

This chrome plugin will find specific regex patterns in the page and convert them into links (`<a>` tags).

Consider the config example below. The regex `findPattern` is used to find any matches inside elements that satisfy the query `limitToContainersQuery` (this query is passed directly into the javascript `document.querySelectorAll` method). If a match is found it will take the match with its group and inject them into the `urlPattern` and `displayText` in their natural order. It is important to note that the javascript regex match index `0` will be the full matched string. So in the example below, the `displayText` will become the full match string. The `urlPattern` will become the first regex group that got matched; in the example below that group is `([0-9]+)`.

## Limitations

Currently only paragraphs (`<p>` tags) are used for matching.


## Quick Start

A very rough first version is ready. Typical config could be:

```
{
    "searches": [{
        "websiteUrlRegexMatches": ["/http://will-not-match-anything.com/i"],
        "limitToContainersQuery": ".my-outer-container",
        "matchDetails": [{
            "findPattern": "/jira issue[^0-9]*([0-9]+)/i",
            "urlPattern": "https://myjira.com/browse/{1}",
            "displayText": "{0}"
        }]
    }]
}
```

This plugin will currently show (opactiy 0.3) on all pages util hovering over it. And only if the websiteUrlRegexMatches matches the current page actually search for the patterns.