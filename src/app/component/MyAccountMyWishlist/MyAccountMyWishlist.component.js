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
import WishlistItem from 'Component/WishlistItem';
import Loader from 'Component/Loader';
import Link from 'Component/Link';
import ShareWishlistPopup from 'Component/ShareWishlistPopup';

import './MyAccountMyWishlist.style';

export default class MyAccountMyWishlist extends PureComponent {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        isWishlistLoading: PropTypes.bool.isRequired,
        removeAll: PropTypes.func.isRequired,
        addAllToCart: PropTypes.func.isRequired,
        shareWishlist: PropTypes.func.isRequired,
        isWishlistEmpty: PropTypes.bool.isRequired,
        wishlistItems: PropTypes.objectOf(ProductType).isRequired
    };

    renderNoProductsFound = () => (
        <div>
            <p>{ __('Wishlist is empty!') }</p>
            <Link
              to="/"
              mix={ {
                  block: 'Button',
                  mix: { block: 'MyAccountMyWishlist', elem: 'NoProductsButton' }
              } }
            >
                { __('Continue shopping') }
            </Link>
        </div>
    );

    renderProduct = ([id, product]) => <WishlistItem key={ id } product={ product } />;

    renderProducts() {
        const { wishlistItems } = this.props;
        return Object.entries(wishlistItems).map(this.renderProduct);
    }

    renderClearWishlist() {
        const {
            isWishlistLoading,
            removeAll,
            isWishlistEmpty
        } = this.props;

        const disabled = isWishlistLoading || isWishlistEmpty;

        return (
            <button
              block="Button"
              onClick={ removeAll }
              disabled={ disabled }
            >
                { __('Clear Wishlist') }
            </button>
        );
    }

    renderAddAllToCart() {
        const {
            isWishlistLoading,
            addAllToCart,
            isWishlistEmpty
        } = this.props;

        const disabled = isWishlistLoading || isWishlistEmpty;

        return (
            <button
              block="Button"
              onClick={ addAllToCart }
              disabled={ disabled }
            >
              { __('Add All to Cart') }
            </button>
        );
    }

    renderShareWishlistButton() {
        const {
            isWishlistLoading,
            shareWishlist,
            isWishlistEmpty
        } = this.props;

        const disabled = isWishlistLoading || isWishlistEmpty;

        return (
            <button
              block="Button"
              onClick={ shareWishlist }
              disabled={ disabled }
            >
                { __('Share Wishlist') }
            </button>
        );
    }

    renderActionLine() {
        return (
            <div block="MyAccountMyWishlist" elem="ActionBar">
                { this.renderShareWishlistButton() }
                { this.renderClearWishlist() }
                { this.renderAddAllToCart() }
            </div>
        );
    }

    renderPlaceholders() {
        return Array.from({ length: 2 }, (_, i) => <ProductCard key={ i } />);
    }

    renderShareWishlist() {
        return <ShareWishlistPopup />;
    }

    renderContent() {
        const {
            isWishlistLoading,
            isWishlistEmpty,
            isLoading
        } = this.props;

        if (isWishlistEmpty && !isWishlistLoading) return this.renderNoProductsFound();

        return (
            <div block="MyAccountMyWishlist" elem="Products">
                <Loader isLoading={ isLoading } />
                { ((isWishlistLoading && isWishlistEmpty)
                    ? this.renderPlaceholders()
                    : this.renderProducts()
                ) }
            </div>
        );
    }

    render() {
        return (
            <div block="MyAccountMyWishlist">
                { this.renderShareWishlist() }
                { this.renderActionLine() }
                { this.renderContent() }
            </div>
        );
    }
}
