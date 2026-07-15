import { ProductLayout, ProductGallery, ProductDetails, ProductTitle, ProductPrice } from '../../components/ecommerce/product-overview';
import { Button } from '../../components/catalyst/button';
import { CopyButton } from './CopyButton';
import { Star } from 'lucide-react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '../../components/catalyst/disclosure';

const product = {
    name: 'Basic Tee 6-Pack',
    price: '$192',
    rating: 3.9,
    reviewCount: 117,
    href: '#',
    images: [
        {
            id: 1,
            name: 'Black',
            src: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-02-secondary-product-shot.jpg',
            alt: 'Two each of gray, white, and black shirts laying flat.',
        },
        {
            id: 2,
            name: 'Dark Gray',
            src: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-02-tertiary-product-shot-01.jpg',
            alt: 'Model wearing plain black basic tee.',
        },
        {
            id: 3,
            name: 'White',
            src: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-02-tertiary-product-shot-02.jpg',
            alt: 'Model wearing plain gray basic tee.',
        },
        {
            id: 4,
            name: 'Gray',
            src: 'https://tailwindui.com/plus/img/ecommerce-images/product-page-02-featured-product-shot.jpg',
            alt: 'Model wearing plain white basic tee.',
        },
    ],
    description:
        'The Basic Tee 6-Pack allows you to fully express your vibrant personality with three grayscale options. Feeling adventurous? Put on a heather gray tee. Want to be a trendsetter? Try our exclusive colorway: "Black". Need to add an extra pop of color to your outfit? Our white tee has you covered.',
    features: [
        { name: 'Cut', value: 'Slim fit' },
        { name: 'Material', value: '100% Cotton' },
        { name: 'Maintenance', value: 'Machine wash' },
    ]
}

export function ProductOverviewView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Product Overview
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        A complete product details page layout with gallery, info, and actions.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Full Example */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Example Implementation
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
                        <ProductLayout>
                            <div className="w-full">
                                <ProductGallery images={product.images} />
                            </div>
                            <ProductDetails>
                                <ProductTitle>{product.name}</ProductTitle>
                                <div className="mt-3">
                                    <h2 className="sr-only">Product information</h2>
                                    <ProductPrice>{product.price}</ProductPrice>
                                </div>

                                <div className="mt-6">
                                    <h3 className="sr-only">Description</h3>

                                    <div
                                        className="space-y-6 text-base text-zinc-700 dark:text-zinc-300"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>

                                <div className="mt-10 flex w-full">
                                    <Button className="w-full justify-center">Add to bag</Button>
                                </div>

                                <div className="mt-10">
                                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                                        <Disclosure>
                                            <DisclosureButton>Features</DisclosureButton>
                                            <DisclosurePanel>
                                                <ul className="list-disc pl-4 space-y-2 mt-2">
                                                    {product.features.map((feature) => (
                                                        <li key={feature.name} className="text-sm text-zinc-600 dark:text-zinc-400">
                                                            <span className="font-medium text-zinc-900 dark:text-zinc-200">{feature.name}:</span> {feature.value}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </DisclosurePanel>
                                        </Disclosure>
                                    </div>
                                </div>

                            </ProductDetails>
                        </ProductLayout>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<ProductLayout>
  <ProductGallery images={product.images} />
  <ProductDetails>
    <ProductTitle>{product.name}</ProductTitle>
    <ProductPrice>{product.price}</ProductPrice>
    <Button>Add to bag</Button>
  </ProductDetails>
</ProductLayout>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
