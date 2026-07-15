import { ProductGrid, ProductCard } from '../../components/ecommerce/product-list';
import { CopyButton } from './CopyButton';
import { Disclosure, DisclosureButton, DisclosurePanel } from '../../components/catalyst/disclosure';
import { Checkbox, CheckboxGroup, CheckboxField } from '../../components/catalyst/checkbox';
import { Label } from '../../components/catalyst/fieldset';

const products = [
    {
        id: 1,
        name: 'Earthen Bottle',
        href: '#',
        price: '$48',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-01.jpg',
        imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
        rating: 4.8,
        inStock: true,
    },
    {
        id: 2,
        name: 'Nomad Tumbler',
        href: '#',
        price: '$35',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-02.jpg',
        imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
        rating: 4.5,
        inStock: true,
    },
    {
        id: 3,
        name: 'Focus Paper Refill',
        href: '#',
        price: '$89',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-03.jpg',
        imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
        rating: 5.0,
        inStock: false,
    },
    {
        id: 4,
        name: 'Machined Mechanical Pencil',
        href: '#',
        price: '$35',
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/category-page-04-image-card-04.jpg',
        imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
        rating: 4.2,
        inStock: true,
    },
];

export function ProductListView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Product List
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        A grid layout for displaying collections of items with support for filters.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Basic Grid */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Product Grid
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900">
                        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
                            {/* Filters Sidebar Example */}
                            <div className="hidden lg:block">
                                <h3 className="sr-only">Filters</h3>
                                <Disclosure defaultOpen>
                                    <DisclosureButton className="py-2">Category</DisclosureButton>
                                    <DisclosurePanel className="pt-2 pb-4">
                                        <CheckboxGroup>
                                            <CheckboxField>
                                                <Checkbox name="category" value="tees" />
                                                <Label>Tees</Label>
                                            </CheckboxField>
                                            <CheckboxField>
                                                <Checkbox name="category" value="accessories" />
                                                <Label>Accessories</Label>
                                            </CheckboxField>
                                        </CheckboxGroup>
                                    </DisclosurePanel>
                                </Disclosure>
                            </div>

                            {/* Product Grid */}
                            <div className="lg:col-span-3">
                                <ProductGrid>
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </ProductGrid>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<ProductGrid>
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</ProductGrid>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
