---
layout: post
title:  "Welcome to Jekyll!"
date:   2014-10-16 20:18:06
categories: jekyll update
---
{% highlight ruby %}
source 'https://rubygems.org'

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

gem 'github-pages', versions['github-pages']
{% endhighlight %}

def print_hi(name)
  puts "Hi, #{name}"
end
print_hi('Tom')
