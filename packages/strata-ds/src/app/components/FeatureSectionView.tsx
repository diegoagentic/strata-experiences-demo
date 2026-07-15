import { FeatureSection, FeatureGrid, Feature, FeatureIcon, FeatureTitle, FeatureDescription } from '../../components/marketing/feature-section';
import { CopyButton } from './CopyButton';
import { CloudUpload, Lock, RefreshCw } from 'lucide-react';

const features = [
    {
        name: 'Push to deploy',
        description:
            'Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu.',
        icon: CloudUpload,
    },
    {
        name: 'SSL certificates',
        description:
            'Pellentesque sit amet porttitor eget dolor morbi non arcu risus. Quis varius quam quisque id diam vel quam elementum.',
        icon: Lock,
    },
    {
        name: 'Simple queues',
        description:
            'Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.',
        icon: RefreshCw,
    },
]

export function FeatureSectionView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Feature Section
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Grid layouts to highlight product features and benefits.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* 3-Column Grid */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        3-Column Grid
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <FeatureSection className="!py-12">
                            <FeatureGrid>
                                {features.map((feature) => (
                                    <Feature key={feature.name}>
                                        <FeatureIcon>
                                            <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </FeatureIcon>
                                        <FeatureTitle>{feature.name}</FeatureTitle>
                                        <FeatureDescription>
                                            {feature.description}
                                        </FeatureDescription>
                                    </Feature>
                                ))}
                            </FeatureGrid>
                        </FeatureSection>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<FeatureSection>
  <FeatureGrid>
    {features.map((feature) => (
      <Feature key={feature.name}>
        <FeatureIcon>
           <feature.icon />
        </FeatureIcon>
        <FeatureTitle>{feature.name}</FeatureTitle>
        <FeatureDescription>{feature.description}</FeatureDescription>
      </Feature>
    ))}
  </FeatureGrid>
</FeatureSection>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
