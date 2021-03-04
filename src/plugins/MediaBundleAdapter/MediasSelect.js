/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class MediasSelect extends Plugin {
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const t = editor.t;

        // Setup `imageUpload` button.
        editor.ui.componentFactory.add('mediaSelect', locale => {
            const view = new ButtonView(locale);
            const insertCommand = editor.commands.get('mediaInsert');

            view.set({
                label: t('Insert image'),
                icon: imageIcon,
                tooltip: true
            });

            view.bind('isEnabled').to(insertCommand);

            view.on('execute', (eventInfo) => {
                const element = eventInfo.source.element;
                const selectMediaEvent = new CustomEvent('selectMedia', {bubbles: true});
                element.dispatchEvent(selectMediaEvent);
            });
            view.on('render', (eventInfo) => {
                const element = eventInfo.source.element;
                element.addEventListener('mediaSelected', (event) => {
                    if (event.detail && event.detail.media) {
                        insertCommand.execute({media: event.detail.media});
                    }
                });
            });

            return view;
        });
    }
}