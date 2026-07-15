import { ShoppingCart } from '../../components/ecommerce/shopping-cart';
import { Button } from '../../components/catalyst/button';
import { CopyButton } from './CopyButton';
import { useState } from 'react';

const products = [
    {
        id: 1,
        name: 'Throwback Hip Bag',
        href: '#',
        color: 'Salmon',
        price: '$90.00',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
        imageAlt: 'Salmon orange fabric pouch with match zipper, gray zipper pull, and adjustable hip belt.',
    },
    {
        id: 2,
        name: 'Medium Stuff Satchel',
        href: '#',
        color: 'Blue',
        price: '$32.00',
        quantity: 1,
        imageSrc: 'https://tailwindui.com/plus/img/ecommerce-images/shopping-cart-page-04-product-02.jpg',
        imageAlt:
            'Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.',
    },
]

export function ShoppingCartView() {
    const [open, setOpen] = useState(false)

    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Shopping Cart
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Slide-over cart with order summary.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Cart Example */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Cart Preview
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900 flex justify-center h-64 items-center">
                        <Button onClick={() => setOpen(true)} variant="primary">View Shopping Cart</Button>

                        <ShoppingCart open={open} onClose={setOpen} items={products} />
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{ label: 'React', value: `<ShoppingCart open={open} onClose={setOpen} items={products} />` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
