/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MediaSelect from './MediaBundleAdapter/MediasSelect';
import MediaSelectCommand from './MediaBundleAdapter/MediaSelectCommand';
import MediaInsertCommand from './MediaBundleAdapter/MediaInsertCommand';

export default class MediaBundleAdapter extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'MediaBundleAdapter';
    }

    init() {
        // Register mediaSelect command.
        this.editor.commands.add( 'mediaSelect', new MediaSelectCommand( this.editor ) );
        this.editor.commands.add( 'mediaInsert', new MediaInsertCommand( this.editor ) );
    }

    /**
     * @inheritDoc
     */
    static get requires() {
        return [ MediaSelect ];
    }
}
