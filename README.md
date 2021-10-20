# Slides.com Search Extension (for Google Chrome)

## Reasoning

<https://slides.com/> is impossible to search outside of the slide you are on, so I have created a chrome extension which allows you to search with a string (or regex) and get a list of links to the slides which have matches

## Instructions for installation

1. Download this project
2. In your chrome, go to `chrome://extensions/`
3. Make sure you are in developer mode (switch is top right in the header)
4. Click 'load unpacked' and point to this directory
5. Pin the extension by pressing the 'jigsaw puzzle piece' next to all the other extensions; scrolling until you find this one and; pressing the 'pin' icon.
6. Profit...

## Notes for use

By default this extension accepts a regular expression. If you want to search for `|` (or any other 'special character') you will have to escape it by searching for `\|`.

## Demo

![Usage Demo](demo-video.gif)

([With sound](https://drive.google.com/file/d/1cSUSqHWa9Srx8AuKelpoyypa6Hgzx-An/view))

## Files explanation

* **popup** files are for the little dropdown when you click the icon
* **options** are for the settings page you get to when you right-click on the icon and select 'options'
* **content.js** is the file that controls what happens in the browser - it is loaded in the window
* **background.js** is the file that controls when the extension runs by hooking into chrome's internal messaging bus, which receives events, e.g. when the page changes.