/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactNativeTextComponent
 */

'use strict';

var ReactNativeComponentTree = require('ReactNativeComponentTree');
var ReactNativeTagHandles = require('ReactNativeTagHandles');
var UIManager = require('UIManager');

var invariant = require('invariant');

var ReactNativeTextComponent = function(text) {
  // This is really a ReactText (ReactNode), not a ReactElement
  this._currentElement = text;
  this._stringText = '' + text;
  this._hostParent = null;
  this._rootNodeID = 0;
};

Object.assign(ReactNativeTextComponent.prototype, {
  mountComponent: function(
    transaction,
    hostParent,
    hostContainerInfo,
    context,
  ) {
    // TODO: hostParent should have this context already. Stop abusing context.
    invariant(
      context.isInAParentText,
      'RawText "%s" must be wrapped in an explicit <Text> component.',
      this._stringText,
    );
    this._hostParent = hostParent;
    var tag = ReactNativeTagHandles.allocateTag();
    this._rootNodeID = tag;
    var nativeTopRootTag = hostContainerInfo._tag;
    UIManager.createView(tag, 'RCTRawText', nativeTopRootTag, {
      text: this._stringText,
    });

    ReactNativeComponentTree.precacheNode(this, tag);

    return tag;
  },

  getHostNode: function() {
    return this._rootNodeID;
  },

  receiveComponent: function(nextText, transaction, context) {
    if (nextText !== this._currentElement) {
      this._currentElement = nextText;
      var nextStringText = '' + nextText;
      if (nextStringText !== this._stringText) {
        this._stringText = nextStringText;
        UIManager.updateView(this._rootNodeID, 'RCTRawText', {
          text: this._stringText,
        });
      }
    }
  },

  unmountComponent: function() {
    ReactNativeComponentTree.uncacheNode(this);
    this._currentElement = null;
    this._stringText = null;
    this._rootNodeID = 0;
  },
});

module.exports = ReactNativeTextComponent;
