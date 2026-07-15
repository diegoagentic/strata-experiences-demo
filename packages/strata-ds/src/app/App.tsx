import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { OverviewView } from './components/OverviewView';
import { BrandingView } from './components/BrandingView';
import { ColorsView } from './components/ColorsView';
import { TransparencyView } from './components/TransparencyView';
import { TypographyView } from './components/TypographyView';
import { SpacingView } from './components/SpacingView';
import { BordersView } from './components/BordersView';
import { ShadowsView } from './components/ShadowsView';
import { ButtonsView } from './components/ButtonsView';
import { BadgesView } from './components/BadgesView';
import { CardsView } from './components/CardsView';
import { AvatarsView } from './components/AvatarsView';
import { AlertsView } from './components/AlertsView';
import { BreadcrumbsView } from './components/BreadcrumbsView';
import { DropdownsView } from './components/DropdownsView';
import { InputGroupsView } from './components/InputGroupsView';
import { FieldsView } from './components/FieldsView';
import { CheckboxesView } from './components/CheckboxesView';
import { RadioGroupsView } from './components/RadioGroupsView';
import { SwitchesView } from './components/SwitchesView';
import { SelectsView } from './components/SelectsView';
import { DataTablesView } from './components/DataTablesView';
import { NavbarsView } from './components/NavbarsView';

import { TextareaView } from './components/TextareaView';
import { ModalsView } from './components/ModalsView';
import { DividersView } from './components/DividersView';
import { ActionPanelsView } from './components/ActionPanelsView';
import { DashboardsView } from './components/DashboardsView';
import { DragDropView } from './components/DragDropView';
import { DataVisualizationView } from './components/DataVisualizationView';
import { DescriptionsView } from './components/DescriptionsView';
import { StackedListsView } from './components/StackedListsView';
import { FeedsView } from './components/FeedsView';
import { StatsView } from './components/StatsView';
import { FileUploadView } from './components/FileUploadView';
import { FormLayoutsView } from './components/FormLayoutsView';
import { AppShellsView } from './components/AppShellsView';
import { SlideOversView } from './components/SlideOversView';
import { PageHeadingsView } from './components/PageHeadingsView';
import { AdvancedFormsView } from './components/AdvancedFormsView';
import { EcommerceView } from './components/EcommerceView';
import { FieldsetView } from './components/FieldsetView';
import { ListboxView } from './components/ListboxView';
import { ComboboxView } from './components/ComboboxView';
import { DisclosureView } from './components/DisclosureView';
import { SlideOverView } from './components/SlideOverView';
import { EmptyStateView } from './components/EmptyStateView';
import { ProductOverviewView } from './components/ProductOverviewView';
import { ProductListView } from './components/ProductListView';
import { HeroSectionView } from './components/HeroSectionView';
import { FeatureSectionView } from './components/FeatureSectionView';
import { PricingView } from './components/PricingView';
import { StackedListView } from './components/StackedListView';
import { DescriptionListView } from './components/DescriptionListView';
import { ShoppingCartView } from './components/ShoppingCartView';
import {
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel
} from './components/ui/sidebar';

type ViewType =
  | 'overview'
  | 'branding'
  | 'colors'
  | 'transparency'
  | 'spacing'
  | 'typography'
  | 'borders'
  | 'shadows'
  | 'buttons'
  | 'action-center'
  | 'cards'
  | 'badges'
  | 'avatars'
  | 'avatars'
  | 'dividers'
  | 'navbars'
  | 'app-shells'
  | 'page-headings'
  | 'action-panels'
  | 'data-tables'
  | 'stacked-lists'
  | 'feeds'
  | 'stats'
  | 'descriptions'
  | 'form-layouts'
  | 'input-groups'
  | 'fields'
  | 'checkboxes'
  | 'radio-groups'
  | 'switches'
  | 'selects'
  | 'textarea'
  | 'file-upload'
  | 'modals'
  | 'slide-overs'
  | 'alerts'
  | 'breadcrumbs'
  | 'dropdowns'
  | 'drag-drop'
  | 'data-visualization'
  | 'figma-export-guide'
  | 'admin'
  | 'api'
  | 'mcp'
  | 'advanced-forms'
  | 'mcp'
  | 'advanced-forms'
  | 'ecommerce'
  | 'fieldset'
  | 'listbox'
  | 'combobox'
  | 'disclosure'
  | 'slide-overs'
  | 'empty-states'
  | 'product-overview'
  | 'product-list'
  | 'hero-section'
  | 'feature-section'
  | 'pricing'
  | 'stacked-list'
  | 'description-list'
  | 'shopping-cart'
  | 'roadmap';

interface NavItem {
  id: ViewType;
  label: string;
  path?: string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navSections: NavSection[] = [
    {
      title: 'Foundations',
      items: [
        { id: 'overview', label: 'Overview' },
        { id: 'branding', label: 'Branding & Assets' },
        { id: 'colors', label: 'Colors' },
        { id: 'transparency', label: 'Transparency' },
        { id: 'spacing', label: 'Spacing/Grid' },
        { id: 'typography', label: 'Typography' },
        { id: 'borders', label: 'Borders & Radius' },
        { id: 'shadows', label: 'Elevation & Shadows' },
      ],
    },
    {
      title: 'Application UI',
      items: [
        { id: 'buttons', label: 'Buttons', path: '/buttons' },
        { id: 'action-center', label: 'Action Center', path: '/action-center', isNew: true },
        { id: 'cards', label: 'Cards', path: '/cards' },
        { id: 'badges', label: 'Badges' },
        { id: 'avatars', label: 'Avatars' },
        { id: 'dividers', label: 'Dividers' },
        { id: 'app-shells', label: 'App Shells' },
        { id: 'page-headings', label: 'Page Headings' },
        { id: 'navbars', label: 'Navbars' },
        { id: 'action-panels', label: 'Action Panels' },
        { id: 'dashboards', label: 'Dashboards', isNew: true },
        { id: 'slide-overs', label: 'Slide-overs' },
      ],
    },
    {
      title: 'Interaction & Data',
      items: [
        { id: 'drag-drop', label: 'Drag & Drop' },
        { id: 'data-visualization', label: 'Data Visualization' },
      ],
    },
    {
      title: 'Lists & Data',
      items: [
        { id: 'data-tables', label: 'Data Tables' },
        { id: 'stacked-lists', label: 'Stacked Lists' },
        { id: 'feeds', label: 'Feeds' },
        { id: 'stats', label: 'Stats' },
        { id: 'descriptions', label: 'Descriptions' },
      ],
    },
    {
      title: 'Forms',
      items: [
        { id: 'form-layouts', label: 'Layouts' },
        { id: 'form-layouts', label: 'Layouts' },
        { id: 'fieldset', label: 'Fieldset', isNew: true },
        { id: 'fields', label: 'Fields' },
        { id: 'input-groups', label: 'Input Groups' },
        { id: 'checkboxes', label: 'Checkboxes' },
        { id: 'radio-groups', label: 'Radio Groups' },
        { id: 'stacked-list', label: 'Stacked List', isNew: true },
        { id: 'description-list', label: 'Description List', isNew: true },
        { id: 'switches', label: 'Switches' },
        { id: 'selects', label: 'Selects' },
        { id: 'listbox', label: 'Listbox', isNew: true },
        { id: 'combobox', label: 'Combobox', isNew: true },
        { id: 'textarea', label: 'Textarea' },
        { id: 'file-upload', label: 'File Upload (OCR)' },
      ],
    },
    {
      title: 'Overlays',
      items: [
        { id: 'modals', label: 'Modals' },
        { id: 'slide-overs', label: 'Slide-overs' },
        { id: 'alerts', label: 'Alerts' },
      ],
    },
    {
      title: 'Navigation',
      items: [
        { id: 'breadcrumbs', label: 'Breadcrumbs' },
        { id: 'dropdowns', label: 'Dropdowns' },
      ],
    },
    {
      title: 'Ecommerce',
      items: [
        { id: 'product-overview', label: 'Product Overview', isNew: true },
        { id: 'product-list', label: 'Product List', isNew: true },
        { id: 'shopping-cart', label: 'Shopping Cart', isNew: true },
      ],
    },
    {
      title: 'Marketing',
      items: [
        { id: 'hero-section', label: 'Hero Section', isNew: true },
        { id: 'feature-section', label: 'Feature Section', isNew: true },
        { id: 'pricing', label: 'Pricing', isNew: true },
      ],
    },
    {
      title: 'Interactions',
      items: [
        { id: 'drag-drop', label: 'Drag & Drop' },
      ],
    },
    {
      title: 'Data Visualization',
      items: [
        { id: 'data-visualization', label: 'Data Visualization' },
      ],
    },
    {
      title: 'Developer Tools',
      items: [
        { id: 'api', label: 'REST API' },
        { id: 'mcp', label: 'Model Context Protocol' },
        { id: 'figma-export-guide', label: 'Figma Export Guide' },
      ],
    },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'branding':
        return <BrandingView />;
      case 'colors':
        return <ColorsView />;
      case 'transparency':
        return <TransparencyView />;
      case 'typography':
        return <TypographyView />;
      case 'spacing':
        return <SpacingView />;
      case 'borders':
        return <BordersView />;
      case 'shadows':
        return <ShadowsView />;
      case 'buttons':
        return <ButtonsView />;
      case 'action-center':
        return <ActionPanelsView />;
      case 'cards':
        return <CardsView />;
      case 'badges':
        return <BadgesView />;
      case 'avatars':
        return <AvatarsView />;
      case 'alerts':
        return <AlertsView />;
      case 'breadcrumbs':
        return <BreadcrumbsView />;
      case 'dropdowns':
        return <DropdownsView />;
      case 'input-groups':
        return <InputGroupsView />;
      case 'fields':
        return <FieldsView />;
      case 'checkboxes':
        return <CheckboxesView />;
      case 'radio-groups':
        return <RadioGroupsView />;
      case 'switches':
        return <SwitchesView />;
      case 'selects':
        return <SelectsView />;
      case 'data-tables':
        return <DataTablesView />;
      case 'navbars':
        return <NavbarsView />;
      case 'textarea':
        return <TextareaView />;

      case 'modals':
        return <ModalsView />;
      case 'slide-overs':
        return <SlideOversView />;
      case 'drag-drop':
        return <DragDropView />;
      case 'data-visualization':
        return <DataVisualizationView />;
      case 'dividers':
        return <DividersView />;
      case 'descriptions':
        return <DescriptionsView />;
      case 'stacked-lists':
        return <StackedListsView />;
      case 'feeds':
        return <FeedsView />;
      case 'stats':
        return <StatsView />;
      case 'action-panels':
        return <ActionPanelsView />;
      case 'dashboards':
        return <DashboardsView />;
      case 'file-upload':
        return <FileUploadView />;
      case 'form-layouts':
        return <FormLayoutsView />;
      case 'form-layouts':
        return <FormLayoutsView />;
      case 'fieldset':
        return <FieldsetView />;
      case 'listbox':
        return <ListboxView />;
      case 'combobox':
        return <ComboboxView />;
      case 'disclosure':
        return <DisclosureView />;
      case 'slide-overs':
        return <SlideOverView />;
      case 'empty-states':
        return <EmptyStateView />;
      case 'product-overview':
        return <ProductOverviewView />;
      case 'product-list':
        return <ProductListView />;
      case 'hero-section':
        return <HeroSectionView />;
      case 'feature-section':
        return <FeatureSectionView />;
      case 'pricing':
        return <PricingView />;
      case 'stacked-list':
        return <StackedListView />;
      case 'description-list':
        return <DescriptionListView />;
      case 'shopping-cart':
        return <ShoppingCartView />;
      case 'app-shells':
        return <AppShellsView />;
      case 'page-headings':
        return <PageHeadingsView />;
      default:
        return (
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {currentView.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Component documentation coming soon...
            </p>
            <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-zinc-500 dark:text-zinc-400">
                This section is under construction
              </p>
            </div>
          </div>
        );
    }
  };

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar className="w-[280px] fixed h-full z-50">
        <SidebarHeader className="px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-zinc-800 dark:bg-zinc-700 rounded-md flex items-center justify-center">
              <span className="text-zinc-50 font-bold text-lg">ST</span>
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-zinc-50">
                Strata v1.0
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                White Label DS
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarBody>
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <SidebarLabel>
                {section.title}
              </SidebarLabel>
              <SidebarSection>
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    current={currentView === item.id}
                    onClick={() => setCurrentView(item.id)}
                  >
                    {item.label}
                  </SidebarItem>
                ))}
              </SidebarSection>
            </div>
          ))}
        </SidebarBody>

        <SidebarFooter className="px-3 py-4">
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              showToast();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                Dark Mode
              </>
            )}
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] overflow-y-auto">
        <div className="max-w-[1280px] mx-auto p-12">
          {renderView()}
        </div>
      </main>

      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 dark:bg-zinc-800 text-zinc-50 rounded-md shadow-lg p-4 flex items-center gap-3 border border-zinc-700 z-50">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold">Theme updated successfully</span>
        </div>
      )}
    </div>
  );
}

export default App;