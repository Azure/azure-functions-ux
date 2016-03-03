define("ace/theme/visualstudio",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
"use strict";

exports.isDark = false;
exports.cssClass = "ace-vs";
exports.cssText = `.ace-vs .ace_gutter {
  background: #f0f0f0;
  color: #333;
}

.ace-vs .ace_print-margin {
  width: 1px;
  background: #e8e8e8;
}

.ace-vs .ace_fold {
    background-color: #6B72E6;
}

.ace-vs {
  background-color: #FFFFFF;
  color: black;
}

.ace-vs .ace_cursor {
  color: black;
}
        
.ace-vs .ace_invisible {
  color: rgb(191, 191, 191);
}

.ace-vs .ace_storage,
.ace-vs .ace_keyword {
  color: rgb(37, 56, 255);
}

.ace-vs .ace_constant {
  color: rgb(197, 6, 11);
}

.ace-vs .ace_constant.ace_buildin {
  color: rgb(88, 72, 246);
}

.ace-vs .ace_constant.ace_language {
  color: rgb(88, 92, 246);
}

.ace-vs .ace_constant.ace_library {
  color: rgb(6, 150, 14);
}

.ace-vs .ace_invalid {
  background-color: rgba(255, 0, 0, 0.1);
  color: red;
}

.ace-vs .ace_support.ace_function {
  color: rgb(60, 76, 114);
}

.ace-vs .ace_support.ace_constant {
  color: rgb(6, 150, 14);
}

.ace-vs .ace_support.ace_type,
.ace-vs .ace_support.ace_class {
  color: rgb(109, 121, 222);
}

.ace-vs .ace_keyword.ace_operator {
  color: rgb(104, 118, 135);
}

.ace-vs .ace_string {
  color: rgb(190, 58, 70);
}

.ace-vs .ace_comment {
  color: rgb(56, 156, 77);
}

.ace-vs .ace_comment.ace_doc {
  color: rgb(56, 156, 77);
}

.ace-vs .ace_comment.ace_doc.ace_tag {
  color: rgb(56, 156, 77);
}

.ace-vs .ace_constant.ace_numeric {
  color: rgb(69, 174, 163);
}

.ace-vs .ace_variable {
  color: rgb(49, 132, 149);
}

.ace-vs .ace_xml-pe {
  color: rgb(104, 104, 91);
}

.ace-vs .ace_entity.ace_name.ace_function {
  color: #0000A2;
}


.ace-vs .ace_heading {
  color: rgb(12, 7, 255);
}

.ace-vs .ace_list {
  color:rgb(185, 6, 144);
}

.ace-vs .ace_meta.ace_tag {
  color:rgb(0, 22, 142);
}

.ace-vs .ace_string.ace_regex {
  color: rgb(255, 0, 0)
}

.ace-vs .ace_marker-layer .ace_selection {
  background: rgb(181, 213, 255);
}
.ace-vs.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px white;
}
.ace-vs .ace_marker-layer .ace_step {
  background: rgb(252, 255, 0);
}

.ace-vs .ace_marker-layer .ace_stack {
  background: rgb(164, 229, 101);
}

.ace-vs .ace_marker-layer .ace_bracket {
  margin: -1px 0 0 -1px;
  border: 1px solid rgb(192, 192, 192);
}

.ace-vs .ace_marker-layer .ace_active-line {
  background: rgba(0, 0, 0, 0.07);
}

.ace-vs .ace_gutter-active-line {
    background-color : #dcdcdc;
}

.ace-vs .ace_marker-layer .ace_selected-word {
  background: rgb(250, 250, 255);
  border: 1px solid rgb(200, 200, 250);
}

.ace-vs .ace_indent-guide {
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;
}`;

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
