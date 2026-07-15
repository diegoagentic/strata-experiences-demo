import { Sparkles, Layers, Zap, Users, TrendingUp, Target, Cpu, Palette, Code2, BarChart3, Shield, Globe } from 'lucide-react';

export function RoadmapView() {
  const systemMetrics = [
    {
      label: 'Foundation Tokens',
      value: '180+',
      description: 'Semantic design tokens',
      trend: '+24% coverage',
      icon: Layers,
      color: 'emerald',
    },
    {
      label: 'AI Interfaces Generated',
      value: '12.4K',
      description: 'Production deployments',
      trend: '+156% QoQ',
      icon: Sparkles,
      color: 'indigo',
    },
    {
      label: 'Component Library',
      value: '31',
      description: 'Enterprise-grade patterns',
      trend: '100% complete',
      icon: Code2,
      color: 'violet',
    },
    {
      label: 'Client Satisfaction',
      value: '94%',
      description: 'CSAT score',
      trend: '+8 NPS',
      icon: TrendingUp,
      color: 'sky',
    },
  ];

  const systemArchitecture = [
    {
      title: 'White Label Foundation',
      description: 'Brand-agnostic design system with 6 core foundation layers (Colors, Typography, Spacing, Borders, Shadows, Grid) optimized for AI-driven customization.',
      icon: Palette,
      metrics: ['11-step color scale', '8 type scales', '12 spacing values', '4 shadow levels'],
    },
    {
      title: 'AI Generation Engine',
      description: 'Machine learning model trained on enterprise UI patterns, automatically generates production-ready interfaces from natural language prompts and business requirements.',
      icon: Cpu,
      metrics: ['GPT-4 powered', 'Real-time generation', 'Context-aware', 'Token optimized'],
    },
    {
      title: 'Expert Review Layer',
      description: 'Human-in-the-loop validation by design system experts ensures brand consistency, accessibility compliance (WCAG AA), and enterprise quality standards.',
      icon: Users,
      metrics: ['24hr turnaround', 'WCAG 2.1 AA', 'Brand compliance', 'Quality gates'],
    },
    {
      title: 'Deployment Pipeline',
      description: 'Automated deployment to client environments with version control, real-time updates, and A/B testing capabilities for continuous optimization.',
      icon: Zap,
      metrics: ['Zero downtime', 'CDN delivery', 'Dark mode', 'i18n ready'],
    },
  ];

  const valuePropositions = [
    {
      title: 'Accelerated Time-to-Market',
      metric: '85%',
      description: 'Reduction in interface development time',
      impact: 'From weeks to hours using AI-powered generation with design system constraints',
      icon: Target,
    },
    {
      title: 'Enterprise Consistency',
      metric: '100%',
      description: 'Design token compliance across products',
      impact: 'Unified brand experience across all client touchpoints with automatic token enforcement',
      icon: Shield,
    },
    {
      title: 'Scalable Operations',
      metric: '10x',
      description: 'Increase in design team output',
      impact: 'Expert designers focus on strategy while AI handles implementation and variations',
      icon: BarChart3,
    },
    {
      title: 'Global Reach',
      metric: '24/7',
      description: 'AI availability for interface generation',
      impact: 'No timezone limitations, instant prototyping, and rapid iteration cycles',
      icon: Globe,
    },
  ];

  const foundationStatus = [
    { name: 'Colors', tokens: 30, status: 'complete', usage: '100%' },
    { name: 'Typography', tokens: 20, status: 'complete', usage: '100%' },
    { name: 'Spacing & Grid', tokens: 29, status: 'complete', usage: '100%' },
    { name: 'Borders & Radius', tokens: 22, status: 'complete', usage: '100%' },
    { name: 'Elevation & Shadows', tokens: 8, status: 'complete', usage: '100%' },
    { name: 'Components', tokens: 71, status: 'in-progress', usage: '68%' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-zinc-50" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              System Overview
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              AI-Powered Design System as a Service for Enterprise Interface Generation
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <strong>Strata DS White Label</strong> is a white label enterprise design system engineered as an AI generation library. 
            Combining <strong>180+ semantic design tokens</strong> with <strong>GPT-4 powered interface generation</strong>, 
            we deliver production-ready, brand-consistent UIs for data-heavy applications in hours instead of weeks.
          </p>
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Key Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
              indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
              violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
              sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
            };
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[metric.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {metric.label}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  {metric.description}
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {metric.trend}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Architecture */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          System Architecture
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Four-layer architecture combining design foundations, AI generation, expert validation, and automated deployment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemArchitecture.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                      {layer.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {layer.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {layer.metrics.map((metric, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Value Propositions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Business Value & ROI
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Quantifiable business outcomes from AI-powered design system implementation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {valuePropositions.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-600 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-zinc-50" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                        {value.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {value.metric}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {value.description}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {value.impact}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Foundation Status */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Foundation Library Status
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-time status of design token coverage and AI training readiness across foundation layers.
        </p>
        <div className="space-y-3">
          {foundationStatus.map((foundation, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5"
            >
              <div className="flex items-center gap-6">
                {/* Name */}
                <div className="w-48">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {foundation.name}
                  </div>
                </div>

                {/* Tokens */}
                <div className="w-32">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Tokens
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {foundation.tokens} tokens
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      AI Training Coverage
                    </div>
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {foundation.usage}
                    </div>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        foundation.status === 'complete'
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: foundation.usage }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="w-32">
                  {foundation.status === 'complete' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      ✓ Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      ⚡ Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          AI Generation Workflow
        </h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Client Input', desc: 'Requirements, brand assets, use cases' },
              { step: '02', title: 'AI Generation', desc: 'GPT-4 creates interfaces using DS tokens' },
              { step: '03', title: 'Expert Review', desc: 'Design validation & quality assurance' },
              { step: '04', title: 'Deployment', desc: 'Production-ready code & assets' },
              { step: '05', title: 'Optimization', desc: 'A/B testing & continuous improvement' },
            ].map((phase, index) => (
              <div key={index} className="relative">
                {index < 4 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-50 font-bold mb-3">
                    {phase.step}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                    {phase.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {phase.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholder Benefits */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Stakeholder Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-3">
              For Product Teams
            </h3>
            <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Rapid prototyping and iteration cycles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Consistent UX across all products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Reduced technical debt and maintenance</span>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-3">
              For Design Teams
            </h3>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span>Focus on strategy vs. execution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span>Automated design system compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                <span>10x increase in design output capacity</span>
              </li>
            </ul>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-violet-900 dark:text-violet-100 mb-3">
              For Executives
            </h3>
            <ul className="space-y-2 text-sm text-violet-800 dark:text-violet-200">
              <li className="flex items-start gap-2">
                <span className="text-violet-600 dark:text-violet-400 mt-0.5">•</span>
                <span>85% faster time-to-market</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 dark:text-violet-400 mt-0.5">•</span>
                <span>Predictable costs and timelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 dark:text-violet-400 mt-0.5">•</span>
                <span>Scalable operations without headcount</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}