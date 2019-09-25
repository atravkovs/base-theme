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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ProductType } from 'Type/ProductList';
import ProductCard from 'Component/ProductCard';
import './MyAccountMyWishlist.style';

export default class MyAccountMyWishlist extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool,
        addAllToCart: PropTypes.func,
        isWishlistEmpty: PropTypes.bool,
        removeAll: PropTypes.func.isRequired,
        getParameters: PropTypes.func.isRequired,
        wishlistItems: PropTypes.objectOf(ProductType).isRequired
    };

    static defaultProps = {
        isLoading: false,
        isWishlistEmpty: false,
        addAllToCart: () => {}
    };

    renderNoProductsFound = () => (
        <div block="MyAccountMyWishlist" elem="NoProducts">
            <h3>Please add products to wishlist first!</h3>
        </div>
    );

    renderProduct = ([sku, product]) => {
        const { getParameters } = this.props;
        const { type_id, quantity, description } = product;

        const parameters = type_id !== 'configurable' ? {} : getParameters(sku, product);

        return (
            <ProductCard
              product={ product }
              selectedFilters={ parameters }
              key={ sku }
            >
                <h1>{ quantity }</h1>
                <h2>{ description }</h2>
            </ProductCard>
        );
    };

    renderProducts() {
        const { wishlistItems } = this.props;
        return Object.entries(wishlistItems).map(this.renderProduct);
    }

    renderActionLine() {
        const {
            isLoading,
            removeAll,
            addAllToCart,
            isWishlistEmpty
        } = this.props;
        const disabled = isLoading || isWishlistEmpty;

        return (
            <div block="MyAccountMyWishlist" elem="ActionBar">
                <button
                  block="Button"
                  onClick={ removeAll }
                  disabled={ disabled }
                >
                    { __('Clear Wishlist') }
                </button>
                <button
                  block="Button"
                  onClick={ addAllToCart }
                  disabled={ disabled }
                >
                    { __('Add All to Cart') }
                </button>
            </div>
        );
    }

    renderPlaceholders() {
        return Array.from({ length: 4 }, (_, i) => <ProductCard key={ i } />);
    }

    renderContent() {
        const { isLoading, isWishlistEmpty } = this.props;

        if (!isWishlistEmpty || isLoading) {
            return (
                <div block="MyAccountMyWishlist" elem="Products">
                    { isLoading ? this.renderPlaceholders() : this.renderProducts() }
                </div>
            );
        }

        return this.renderNoProductsFound();
    }

    render() {
        return (
            <div block="MyAccountMyWishlist">
                { this.renderActionLine() }
                { this.renderContent() }
            </div>
        );
    }
}