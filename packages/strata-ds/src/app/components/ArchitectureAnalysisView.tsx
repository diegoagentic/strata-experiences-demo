import { 
  Server, 
  Zap, 
  Shield, 
  TrendingUp, 
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gauge,
  Layers,
  Cloud,
  Box,
  Database,
  Activity
} from 'lucide-react';

export function ArchitectureAnalysisView() {
  const techStacks = [
    {
      name: 'Node.js + Express + TypeScript',
      icon: Server,
      color: 'emerald',
      recommended: true,
      rating: 9.2,
      pros: [
        'Same language as frontend (TypeScript)',
        'Huge ecosystem and middleware availability',
        'Excellent performance for I/O operations',
        'Easy deployment (Vercel, Railway, Render)',
        'Strong community and documentation',
        'Perfect for JSON APIs',
        'Non-blocking async/await support'
      ],
      cons: [
        'Single-threaded (but sufficient for this use case)',
        'Type safety requires extra setup',
        'Less structured than NestJS'
      ],
      bestFor: 'RESTful APIs, microservices, real-time apps',
      performance: 95,
      scalability: 90,
      devExperience: 92,
      maintenance: 88
    },
    {
      name: 'Python + FastAPI',
      icon: Zap,
      color: 'indigo',
      recommended: true,
      rating: 9.0,
      pros: [
        'Auto-generated OpenAPI/Swagger docs',
        'Native type hints (Pydantic)',
        'Very fast (ASGI server)',
        'Excellent for data processing',
        'Clean async/await syntax',
        'Great for ML/AI integrations',
        'Strong typing out of the box'
      ],
      cons: [
        'Different language from frontend',
        'Smaller ecosystem than Node.js',
        'Less middleware options',
        'Async ecosystem still maturing'
      ],
      bestFor: 'API-first development, data-heavy apps, ML integration',
      performance: 93,
      scalability: 88,
      devExperience: 90,
      maintenance: 85
    },
    {
      name: 'Node.js + NestJS',
      icon: Layers,
      color: 'violet',
      recommended: false,
      rating: 8.5,
      pros: [
        'Enterprise-grade architecture',
        'Decorators and dependency injection',
        'TypeScript native',
        'Modular structure',
        'Built-in testing utilities',
        'Great for large teams',
        'Swagger integration'
      ],
      cons: [
        'Steeper learning curve',
        'More boilerplate code',
        'Overkill for simple APIs',
        'Slower initial setup'
      ],
      bestFor: 'Large enterprise apps, microservices, complex business logic',
      performance: 88,
      scalability: 95,
      devExperience: 82,
      maintenance: 92
    },
    {
      name: 'Serverless (AWS Lambda/Vercel)',
      icon: Cloud,
      color: 'amber',
      recommended: false,
      rating: 7.8,
      pros: [
        'Auto-scaling',
        'Pay per use',
        'Zero infrastructure management',
        'Global edge deployment',
        'Easy CI/CD'
      ],
      cons: [
        'Cold start latency',
        'Vendor lock-in',
        'Complex debugging',
        'Limited execution time',
        'Higher complexity for local dev'
      ],
      bestFor: 'Event-driven apps, variable traffic, minimal maintenance',
      performance: 75,
      scalability: 98,
      devExperience: 70,
      maintenance: 95
    }
  ];

  const architecturePatterns = [
    {
      name: 'Monolith',
      description: 'Single codebase serving all endpoints',
      pros: ['Simple deployment', 'Easy local development', 'Shared code', 'Single database'],
      cons: ['Harder to scale specific parts', 'All or nothing deployment'],
      recommended: true,
      useCase: 'MVP, small-medium apps, limited team'
    },
    {
      name: 'Microservices',
      description: 'Separate services for foundations, components, search',
      pros: ['Independent scaling', 'Technology flexibility', 'Isolated failures', 'Team autonomy'],
      cons: ['Complex deployment', 'Network overhead', 'Distributed debugging', 'Higher ops cost'],
      recommended: false,
      useCase: 'Large scale, multiple teams, complex domain'
    },
    {
      name: 'Serverless Functions',
      description: 'Each endpoint as a separate function',
      pros: ['Auto-scaling', 'Pay per use', 'No server management', 'Easy deployment'],
      cons: ['Cold starts', 'Vendor lock-in', 'Local dev complexity', 'Connection pooling issues'],
      recommended: false,
      useCase: 'Variable traffic, event-driven, minimal maintenance'
    }
  ];

  const scenarios = [
    {
      title: 'Scenario 1: MVP / Small Team',
      icon: Box,
      color: 'emerald',
      recommendation: 'Node.js + Express + TypeScript (Monolith)',
      reasoning: [
        'Quick to build and iterate',
        'Single codebase is easier to manage',
        'Low operational complexity',
        'Easy to deploy on Railway/Render/Vercel',
        'Can migrate to microservices later if needed'
      ],
      stack: {
        backend: 'Node.js + Express + TypeScript',
        database: 'PostgreSQL or MongoDB',
        cache: 'In-memory (node-cache) or Redis',
        deployment: 'Railway/Render/Vercel',
        monitoring: 'Built-in logging'
      }
    },
    {
      title: 'Scenario 2: Enterprise / Production',
      icon: Server,
      color: 'indigo',
      recommendation: 'Node.js + NestJS or FastAPI (Modular Monolith)',
      reasoning: [
        'Better code organization for large teams',
        'Strong typing and validation',
        'Auto-generated API documentation',
        'Easy to split into microservices later',
        'Better testing infrastructure'
      ],
      stack: {
        backend: 'NestJS or FastAPI',
        database: 'PostgreSQL with connection pooling',
        cache: 'Redis cluster',
        deployment: 'AWS ECS/EKS or Google Cloud Run',
        monitoring: 'DataDog/New Relic/Grafana'
      }
    },
    {
      title: 'Scenario 3: High Traffic / Global',
      icon: Activity,
      color: 'violet',
      recommendation: 'Hybrid: Static CDN + Serverless Functions',
      reasoning: [
        'Design system data is mostly static',
        'CDN for foundation/component data',
        'Serverless for search and dynamic queries',
        'Edge functions for low latency worldwide',
        'Cost-effective at scale'
      ],
      stack: {
        backend: 'Serverless Functions (Vercel/Cloudflare Workers)',
        database: 'Edge database (PlanetScale/Neon)',
        cache: 'CDN (Cloudflare/Fastly)',
        deployment: 'Vercel Edge Functions',
        monitoring: 'Vercel Analytics/Cloudflare Analytics'
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800'
      },
      violet: {
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800'
      }
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          Backend Architecture Analysis
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-4xl">
          Comprehensive analysis of backend technology options and architecture patterns for the Strata DS API.
        </p>
      </div>

      {/* Technology Stack Comparison */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Technology Stack Comparison
        </h2>
        <div className="space-y-6">
          {techStacks.map((stack) => {
            const Icon = stack.icon;
            const colors = getColorClasses(stack.color);
            
            return (
              <div 
                key={stack.name}
                className={`bg-white dark:bg-zinc-900 border-2 ${
                  stack.recommended ? colors.border : 'border-zinc-200 dark:border-zinc-800'
                } rounded-lg overflow-hidden`}
              >
                {/* Header */}
                <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                          {stack.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{stack.bestFor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stack.recommended && (
                        <span className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-xs font-bold uppercase tracking-wider`}>
                          Recommended
                        </span>
                      )}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stack.rating}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Overall</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Pros */}
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {stack.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {stack.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Performance', value: stack.performance },
                      { label: 'Scalability', value: stack.scalability },
                      { label: 'Dev Experience', value: stack.devExperience },
                      { label: 'Maintenance', value: stack.maintenance }
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{metric.label}</div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors.bg}`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                        <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">{metric.value}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Patterns */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Architecture Patterns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {architecturePatterns.map((pattern) => (
            <div 
              key={pattern.name}
              className={`bg-white dark:bg-zinc-900 border-2 ${
                pattern.recommended 
                  ? 'border-emerald-200 dark:border-emerald-800' 
                  : 'border-zinc-200 dark:border-zinc-800'
              } rounded-lg p-6`}
            >
              {pattern.recommended && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold uppercase">
                    Recommended
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {pattern.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {pattern.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Pros</h4>
                <ul className="space-y-1">
                  {pattern.pros.map((pro, idx) => (
                    <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1">
                      <span className="text-emerald-600 dark:text-emerald-400">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Cons</h4>
                <ul className="space-y-1">
                  {pattern.cons.map((con, idx) => (
                    <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1">
                      <span className="text-red-600 dark:text-red-400">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Best for</h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">{pattern.useCase}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Recommended Solutions by Scenario
        </h2>
        <div className="space-y-6">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const colors = getColorClasses(scenario.color);
            
            return (
              <div 
                key={scenario.title}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
              >
                <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {scenario.title}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Shield className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-2">Recommendation</h4>
                        <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                          {scenario.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Reasoning</h4>
                      <ul className="space-y-2">
                        {scenario.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 mb-3">Technology Stack</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(scenario.stack).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                              {key}
                            </div>
                            <div className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Recommendation */}
      <div className="bg-gradient-to-br from-emerald-50 to-indigo-50 dark:from-emerald-950/20 dark:to-indigo-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Final Recommendation for Strata DS
            </h2>
            <p className="text-lg text-zinc-700 dark:text-zinc-300">
              Based on the analysis, here's the optimal solution:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Phase 1: MVP (Now)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Backend:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> Node.js + Express + TypeScript</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Architecture:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> Modular Monolith</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Database:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> PostgreSQL (structured data) or JSON files (simple)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Caching:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> In-memory (node-cache)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Deployment:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> Railway/Render</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Phase 2: Scale (Future)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Upgrade to:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> NestJS for better structure</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Add:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> Redis for distributed caching</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Consider:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> CDN for static component data</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Deploy:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> AWS ECS/EKS or Google Cloud Run</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-50">Monitor:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400"> DataDog/New Relic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
