import React, { Component } from 'react';
import ExpandableContent from 'Component/ExpandableContent';
import Html from 'Component/Html';
import ContentWrapper from 'Component/ContentWrapper';
import Image from 'Component/Image';
import { ProductType } from 'Type/ProductList';
import './ProductInformation.style';
import TextPlaceholder from 'Component/TextPlaceholder';

const PRODUCT_IMAGE_PATH = '/media/catalog/product';

class ProductInformation extends Component {
    renderContentPlaceholder() {
        return (
            <div block="ProductInformation" elem="Placeholder">
              <TextPlaceholder length="medium" />
              <TextPlaceholder length="long" />
              <TextPlaceholder length="medium" />
              <TextPlaceholder length="long" />
              <TextPlaceholder />
              <TextPlaceholder length="medium" />
              <TextPlaceholder length="long" />
            </div>
        );
    }

    render() {
        const { product: { description, image } } = this.props;
        const { html } = description || {};
        const { path } = image || {};

        return (
            <ContentWrapper
              label="Product information"
              mix={ { block: 'ProductInformation' } }
              wrapperMix={ { block: 'ProductInformation', elem: 'Wrapper' } }
            >
                <Image
                  src={ path ? `${PRODUCT_IMAGE_PATH}${path}` : '' }
                  alt="Product image"
                  mix={ { block: 'ProductInformation', elem: 'Image' } }
                />
                <ExpandableContent
                  heading="Product information"
                  mix={ { block: 'ProductInformation', elem: 'Content' } }
                >
                    { html ? <Html content={ html } /> : this.renderContentPlaceholder() }
                </ExpandableContent>
            </ContentWrapper>
        );
    }
}

ProductInformation.propTypes = {
    product: ProductType.isRequired
};

export default ProductInformation;