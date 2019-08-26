/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { MixType } from 'Type/Common';
import Image from './Image.component';

export const mapStateToProps = state => ({
    groupedProductQuantity: state.ProductReducer.groupedProductQuantity
});

export class ImageContainer extends PureComponent {
    constructor(props) {
        super(props);

        this.containerProps = () => ({
            style: this._getStyle()
        });
    }

    _parseSize(size) {
        const trimmedSize = size.trim();
        if (!trimmedSize) return 'auto';

        if (
            trimmedSize.slice(-2) === 'px'
            || trimmedSize.slice(-1) === '%'
        ) {
            return trimmedSize;
        }

        return `${trimmedSize}px`;
    }

    _getCorrectSize() {
        const { width, height } = this.props;

        const correctHeight = this._parseSize(height);
        const correctWidth = this._parseSize(width);

        return { width: correctWidth, height: correctHeight };
    }

    _getStyle() {
        return this._getCorrectSize();
    }

    render() {
        return (
            <Image
              { ...this.props }
              { ...this.containerProps() }
            />
        );
    }
}

ImageContainer.propTypes = {
    isPlaceholder: PropTypes.bool,
    src: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ]),
    width: PropTypes.string,
    height: PropTypes.string,
    alt: PropTypes.string,
    ratio: PropTypes.oneOf([
        '4x3',
        '16x9',
        'square',
        'custom'
    ]),
    mix: MixType
};

ImageContainer.defaultProps = {
    src: '',
    alt: '',
    ratio: 'square',
    mix: {},
    height: '',
    width: '',
    isPlaceholder: false
};

export default connect(mapStateToProps)(ImageContainer);
