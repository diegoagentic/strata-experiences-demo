import { PricingSection, PricingCard, PricingTitle, PricingCost, PricingFeatures, PricingFeature, PricingPrice } from '../../components/marketing/pricing';
import { Button } from '../../components/catalyst/button';
import { CopyButton } from './CopyButton';

const tiers = [
    {
        name: 'Freelancer',
        id: 'tier-freelancer',
        href: '#',
        price: '$24',
        description: 'The essentials to provide your best work for clients.',
        features: ['5 products', 'Up to 1,000 subscribers', 'Basic analytics', '48-hour support response time'],
        featured: false,
    },
    {
        name: 'Startup',
        id: 'tier-startup',
        href: '#',
        price: '$32',
        description: 'A plan that scales with your rapidly growing business.',
        features: [
            '25 products',
            'Up to 10,000 subscribers',
            'Advanced analytics',
            '24-hour support response time',
            'Marketing automations',
        ],
        featured: true,
    },
]

export function PricingView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Pricing
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Pricing tables designed to drive conversions.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Simple Tiers */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Side-by-side Tiers
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                        <PricingSection className="!py-12 px-6">
                            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
                                {tiers.map((tier) => (
                                    <PricingCard key={tier.id} featured={tier.featured} className="flex flex-col justify-between">
                                        <div>
                                            <PricingTitle featured={tier.featured}>{tier.name}</PricingTitle>
                                            <PricingCost featured={tier.featured}>{tier.price}</PricingCost>
                                            <PricingPrice featured={tier.featured}>{tier.description}</PricingPrice>
                                            <PricingFeatures>
                                                {tier.features.map((feature) => (
                                                    <PricingFeature key={feature} featured={tier.featured}>
                                                        {feature}
                                                    </PricingFeature>
                                                ))}
                                            </PricingFeatures>
                                        </div>
                                        <Button
                                            className="mt-8 w-full cursor-pointer"
                                            variant={tier.featured ? 'primary' : 'outline'}
                                        >
                                            Buy plan
                                        </Button>
                                    </PricingCard>
                                ))}
                            </div>
                        </PricingSection>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<PricingCard featured={featured}>
  <PricingTitle featured={featured}>Makeup</PricingTitle>
  <PricingCost featured={featured}>$32</PricingCost>
  <PricingFeatures>
     <PricingFeature featured={featured}>Feature 1</PricingFeature>
  </PricingFeatures>
  <Button color={featured ? 'white' : 'blue'}>Buy plan</Button>
</PricingCard>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
