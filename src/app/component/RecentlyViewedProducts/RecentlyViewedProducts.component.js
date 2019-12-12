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
import ContentWrapper from 'Component/ContentWrapper';
import ProductCard from 'Component/ProductCard';
import { ItemsType } from 'Type/ProductList';
import './RecentlyViewedProducts.style';

/**
 * RecentlyViewed products block
 * @class RecentlyViewedProducts
 */
export default class RecentlyViewedProducts extends PureComponent {
    static propTypes = {
        products: ItemsType.isRequired
    };

    renderProduct(product, i) {
        const { id, selectedFilters } = product;

        return (
            <ProductCard
              product={ product }
              key={ `${id}_${i}` }
              selectedFilters={ selectedFilters }
            />
        );
    }

    renderNoProducts() {
        return (
            <p block="RecentlyViewedProducts" elem="EmptyList">
                { __('No recently viewed products.') }
            </p>
        );
    }

    renderProducts() {
        const { products } = this.props;

        if (!products.length) return this.renderNoProducts();

        return (
            <ul block="RecentlyViewedProducts" elem="List">
                { products.map(this.renderProduct) }
            </ul>
        );
    }

    renderLabel() {
        return (
            <h4 block="RecentlyViewedProducts" elem="Label">
                { __('Recently viewed products') }
            </h4>
        );
    }

    render() {
        return (
            <ContentWrapper
              label="Recently viewed products"
              mix={ { block: 'RecentlyViewedProducts' } }
              wrapperMix={ { block: 'RecentlyViewedProducts', elem: 'Wrapper' } }
            >
                { this.renderLabel() }
                { this.renderProducts() }
            </ContentWrapper>
        );
    }
}
