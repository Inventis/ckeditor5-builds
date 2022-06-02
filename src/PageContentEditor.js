/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import attachToForm from '@ckeditor/ckeditor5-core/src/editor/utils/attachtoform';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import secureSourceElement from '@ckeditor/ckeditor5-core/src/editor/utils/securesourceelement';
import BalloonEditorUIView from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditoruiview';
import BalloonEditorUI from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditorui';
import {BalloonToolbar} from '@ckeditor/ckeditor5-ui';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';

import './theme/overrides.css'

// These classes apply styling to the editable (the element the editor is activated on). We don't want that for our
// inline editor.
const editableClassesToRemove = ['ck-editor__editable', 'ck-rounded-corners', 'ck-editor__editable_inline']

export default class PageContentEditor extends Editor {
    constructor(sourceElement, config) {
        super(config);

        this.sourceElement = sourceElement;
        secureSourceElement(this);

        const plugins = this.config.get('plugins');
        plugins.push(BalloonToolbar);

        this.config.set('plugins', plugins);

        this.config.define('balloonToolbar', this.config.get('toolbar'));

        this.model.schema.register('$inlineRoot', {
            isLimit: true,
            isInline: true
        });
        this.model.schema.extend('$text', {
            allowIn: ['$inlineRoot']
        });

        this.model.document.createRoot(config.isInline ? '$inlineRoot' : '$root');

        const view = new BalloonEditorUIView(this.locale, this.editing.view, this.sourceElement);
        this.filterEditableClasses(view, editableClassesToRemove);
        this.ui = new BalloonEditorUI(this, view);

        attachToForm(this);
    }

    destroy() {
        // Cache the data, then destroy.
        // It's safe to assume that the model->view conversion will not work after super.destroy().
        const data = this.getData();

        this.ui.destroy();

        return super.destroy()
            .then(() => {
                if (this.sourceElement) {
                    setDataInElement(this.sourceElement, data);
                }
            });
    }

    static create(sourceElement, config = {}) {
        return new Promise(resolve => {
            if (sourceElement.tagName === 'TEXTAREA') {
                throw new CKEditorError('editor-wrong-element', null);
            }

            const editor = new this(sourceElement, updateConfig(sourceElement, config));

            resolve(
                editor.initPlugins()
                    .then(() => {
                        editor.ui.init();
                    })
                    .then(() => editor.data.init(getDataFromElement(sourceElement)))
                    .then(() => editor.fire('ready'))
                    .then(() => editor)
            );
        });
    }

    filterEditableClasses(view, toRemove) {
        const currentClasses = view.editable.template.attributes['class'] || [];
        view.editable.template.attributes['class'] = currentClasses.filter(name => toRemove.indexOf(name) === -1);
    }
}

/**
 * Updates the provided config to ensure it is valid for the context it is going to be used in.
 *
 * @param {HTMLElement} sourceElement
 * @param {Object} config
 * @returns {Object}
 */
function updateConfig(sourceElement, config) {
    const removePlugins = [];
    const removeToolbarItems = [];

    if (config.isInline === true) {
        removeToolbarItems.push('heading');
        removeToolbarItems.push('outdent');
        removeToolbarItems.push('indent');
    }

    // Disable the `link` option when `sourceElement` is nested inside a link. Don't use `instanceof` here as the
    // elements may come from a different window.
    if (isElementNestedIn(sourceElement, 'A')) {
        removeToolbarItems.push('link');
        removePlugins.push('Link');
    }

    config.removePlugins = [
        ...config.removePlugins || [],
        ...removePlugins,
    ];

    // The toolbar can be an array or an object, see
    // https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-toolbar.
    // If it is an array, we convert to an object.
    if (Array.isArray(config.toolbar)) {
        config.toolbar = {
            items: config.toolbar,
        };
    } else if (config.toolbar === undefined) {
        config.toolbar = {};
    }

    config.toolbar.removeItems = [
        ...config.toolbar.removeItems || [],
        ...removeToolbarItems
    ];

    return config;
}

function isElementNestedIn(element, type) {
    let current = element;
    while (current.tagName !== type) {
        current = current.parentElement;
        if (current === null) {
            return false;
        }
    }
    return true;
}

// Plugins to include in the build.
PageContentEditor.builtinPlugins = [
    Essentials,
    Alignment,
    Autoformat,
    Bold,
    Italic,
    Underline,
    Heading,
    Indent,
    Link,
    List,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    Subscript,
    Superscript
];

PageContentEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'subscript',
            'superscript',
            '|',
            'outdent',
            'indent'
        ]
    },

    heading: {
        options: [
            {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
            {model: 'heading2', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading2'},
            {model: 'heading3', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading3'},
            {model: 'heading4', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading4'},
            {model: 'heading5', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading5'},
            {model: 'heading6', view: 'h6', title: 'Heading 5', class: 'ck-heading_heading6'}
        ]
    },

    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },

    link: {
        decorators: {
            openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                },
            },
        },
    },

    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en'
};

mix(PageContentEditor, DataApiMixin);
mix(PageContentEditor, ElementApiMixin);
