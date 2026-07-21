import ActionCenter from '../components/notifications/ActionCenter';

export default function NotificationCenterBlock() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* defaultOpen · shared-block preview auto-opens the popover on mount
          so viewers see the full Action Center panel immediately instead
          of just the bell trigger. Tour behavior unchanged (Navbar mounts
          ActionCenter without the prop → stays click-to-open). */}
      <ActionCenter defaultOpen />
    </div>
  );
}
