/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array.<string>>|!Function)} menuGenerator An array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDropdown = function (menuGenerator, opt_validator) {
  this.menuGenerator_ = menuGenerator;
  this.trimOptions_();
  var firstTuple = this.getOptions_()[0];

  // Call parent's constructor.
  Blockly.FieldDropdown.superClass_.constructor.call(this, firstTuple[1],
    opt_validator);
};
goog.inherits(Blockly.FieldDropdown, Blockly.Field);

//adiconando as variaveis de imagens 

/**
 * The y offset from the top of the field to the top of the image, if an image
 * is selected.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_OFFSET = 5;

/**
 * The total vertical padding above and below an image.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_PADDING =
  Blockly.FieldDropdown.IMAGE_Y_OFFSET * 2;







/**
 * Horizontal distance that a checkmark ovehangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;





/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
Blockly.FieldDropdown.ARROW_CHAR = goog.userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Install this dropdown on a block.
 */
Blockly.FieldDropdown.prototype.init = function () {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  this.arrow_ = Blockly.createSvgElement('tspan', {}, null);
  this.arrow_.appendChild(document.createTextNode(
    this.sourceBlock_.RTL ? Blockly.FieldDropdown.ARROW_CHAR + ' ' :
      ' ' + Blockly.FieldDropdown.ARROW_CHAR));

  Blockly.FieldDropdown.superClass_.init.call(this);
  // Force a reset of the text to add the arrow.
  var text = this.text_;
  this.text_ = null;
 // console.log(text);
  this.setText(text);
};


Blockly.FieldDropdown.ImageProperties;
//https://github.com/google/blockly/blob/master/core/field_dropdown.js
/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @return {!Blockly.FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdown.fromJson = function (options) {
  return new Blockly.FieldDropdown(options['options'], undefined, options);
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.FieldDropdown.prototype.showEditor_ = function () {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
  var thisField = this;

  function callback(e) {
    var menuItem = e.target;
    if (menuItem) {
      var value = menuItem.getValue();
      //console.log(value);
      if (thisField.sourceBlock_ && thisField.validator_) {
        // Call any validation function, and allow it to override.
        var override = value;
        if (override !== undefined) {
          value = override;
        }
      }
      if (value !== null) {
        ///console.log('165',value);
        thisField.setValue(value);
      }
    }
    Blockly.WidgetDiv.hideIfOwner(thisField);
  }


  var menu = new goog.ui.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  var options = this.getOptions_();

  for (var x = 0; x < options.length; x++) {

    var text = options[x][0];  // Human-readable text.
    var value = options[x][1]; // Language-neutral value
    var imagem_src = options[x][2];
    console.log(imagem_src);
    var menuItem = new goog.ui.MenuItem(text);

   // console.log(menuItem);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    // menuItem.setValue(value);
    
    menuItem.setCheckable(true);

    if (typeof options[x][2] != 'undefined') {
      var imagem = $("<img/>")
      imagem[0].src = imagem_src;
      imagem[0].className = 'ImagemDropdown';
      imagem[0].value=value;
      menuItem.setValue(imagem);
      menuItem.content_ = imagem;
      //console.log(menuItem);
      menu.addChild(menuItem, true);
      menuItem.setChecked(value == this.value_);
    } else {
      menuItem.setValue(imagem_src);
      menu.addChild(menuItem, true);
      menuItem.setChecked(value == this.value_);
    }

  }
  // Listen for mouse/keyboard events.
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
  // Listen for touch events (why doesn't Closure handle this already?).
  function callbackTouchStart(e) {
    var control = this.getOwnerControl(/** @type {Node} */(e.target));
    // Highlight the menu item.
    control.handleMouseDown(e);
  }
  function callbackTouchEnd(e) {
    var control = this.getOwnerControl(/** @type {Node} */(e.target));
    // Activate the menu item.
    control.performActionInternal(e);
  }
  menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHSTART,
    callbackTouchStart);
  menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHEND,
    callbackTouchEnd);

  // Record windowSize and scrollOffset before adding menu.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = this.getAbsoluteXY_();
  var borderBBox = this.getScaledBBox_();
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  var menuDom = menu.getElement();
  Blockly.addClass_(menuDom, 'blocklyDropdownMenu');
  // Record menuSize after adding menu.
  var menuSize = goog.style.getSize(menuDom);
  // Recalculate height for the total content, not only box height.
  menuSize.height = menuDom.scrollHeight;

  // Position the menu.
  // Flip menu vertically if off the bottom.
  if (xy.y + menuSize.height + borderBBox.height >=
    windowSize.height + scrollOffset.y) {
    xy.y -= menuSize.height + 2;
  } else {
    xy.y += borderBBox.height;
  }
  if (this.sourceBlock_.RTL) {
    xy.x += borderBBox.width;
    xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
    // Don't go offscreen left.
    if (xy.x < scrollOffset.x + menuSize.width) {
      xy.x = scrollOffset.x + menuSize.width;
    }
  } else {
    xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
    // Don't go offscreen right.
    if (xy.x > windowSize.width + scrollOffset.x - menuSize.width) {
      xy.x = windowSize.width + scrollOffset.x - menuSize.width;
    }
  }
  //onde o menu aparece
  Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
    this.sourceBlock_.RTL);
  menu.setAllowAutoFocus(true);
  menuDom.focus();
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function () {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!goog.isArray(options) || options.length < 2) {
    return;
  }
  var strings = options.map(function (t) { return t[0]; });
  var shortest = Blockly.shortestStringLength(strings);
  var prefixLength = Blockly.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }
  // Remove the prefix and suffix from the options.
  var newOptions = [];
  for (var x = 0; x < options.length; x++) {
    var text = options[x][0];
    var value = options[x][1];
    var imagem_src = (typeof options[x][2] != 'undefined')?  options[x][2] : undefined;
    
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[x] = [text, value, imagem_src];
  }
  this.menuGenerator_ = newOptions;
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array.<string>>} Array of option tuples:
 *     (human-readable text, language-neutral name).
 * @private
 */
Blockly.FieldDropdown.prototype.getOptions_ = function () {
  if (goog.isFunction(this.menuGenerator_)) {
    return this.menuGenerator_.call(this);
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.FieldDropdown.prototype.getValue = function () {
  return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.FieldDropdown.prototype.setValue = function (newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
      this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  for (var x = 0; x < options.length; x++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (options[x][1] == newValue) {
      this.setText(options[x][0]);
      return;
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  //console.log('new value ', newValue);
  this.setText(newValue);
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.FieldDropdown.prototype.setText = function (text) {
  if (this.sourceBlock_ && this.arrow_) {
    // Update arrow's colour.
    this.arrow_.style.fill = this.sourceBlock_.getColour();
  }
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  console.log('372  aquiiii ',this.text_);
  this.updateTextNode_();

  if (this.textElement_) {
    // Insert dropdown arrow.
    if (this.sourceBlock_.RTL) {
      this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild);
    } else {
      this.textElement_.appendChild(this.arrow_);
    }
  }

  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();//------------
    this.sourceBlock_.bumpNeighbours_();
  }
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.FieldDropdown.prototype.dispose = function () {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDropdown.superClass_.dispose.call(this);
};
