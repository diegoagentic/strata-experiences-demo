import OrderCreationForm from '../components/forms/OrderCreationForm';

export default function OrderCreationBlock() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <OrderCreationForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </div>
  );
}
