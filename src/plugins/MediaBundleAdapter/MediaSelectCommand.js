/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class MediaSelectCommand extends Command {
    execute() {
        const selectMediaEvent = new CustomEvent('selectMedia', {bubbles: true});
        this.editor.element.dispatchEvent(selectMediaEvent);
    }
}