import { Hero, HeroTitle, HeroSubtitle, HeroButtons, HeroImage } from '../../components/marketing/hero-section';
import { Button } from '../../components/catalyst/button';
import { CopyButton } from './CopyButton';

export function HeroSectionView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Hero Section
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        High-impact headers for landing pages and marketing sites.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Simple Centered Hero */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        Centered Hero
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <Hero className="text-center">
                            <div className="mx-auto max-w-2xl px-6 lg:px-8">
                                <HeroTitle>
                                    Data to enrich your <span className="text-blue-600 dark:text-blue-400">online business</span>
                                </HeroTitle>
                                <HeroSubtitle>
                                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.
                                </HeroSubtitle>
                                <HeroButtons className="justify-center">
                                    <Button variant="primary">Get started</Button>
                                    <Button variant="outline">Learn more <span aria-hidden="true">→</span></Button>
                                </HeroButtons>
                            </div>
                        </Hero>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<Hero className="text-center">
  <div className="mx-auto max-w-2xl">
    <HeroTitle>
      Data to enrich your <span className="text-blue-600">online business</span>
    </HeroTitle>
    <HeroSubtitle>
      Anim aute id magna aliqua ad ad non deserunt sunt.
    </HeroSubtitle>
    <HeroButtons className="justify-center">
      <Button color="blue">Get started</Button>
      <Button outline>Learn more &rarr;</Button>
    </HeroButtons>
  </div>
</Hero>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
