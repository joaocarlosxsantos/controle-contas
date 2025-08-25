import { UserGroupIcon, PhoneIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";

export function FamilyCard({ name, phone }: { name: string; phone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-neutral-800 dark:to-neutral-900 p-4 shadow group transition-transform hover:scale-[1.03] hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 dark:bg-blue-900">
        <UserGroupIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-blue-900 dark:text-blue-200">{name}</div>
        <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
          <PhoneIcon className="h-4 w-4" />
          {phone}
        </div>
      </div>
    </div>
  );
}

export function BillCard({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-neutral-800 dark:to-neutral-900 p-4 shadow group transition-transform hover:scale-[1.03] hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200 dark:bg-green-900">
        <ReceiptPercentIcon className="h-6 w-6 text-green-700 dark:text-green-300" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-green-900 dark:text-green-200">{name}</div>
        <div className="text-sm text-green-700 dark:text-green-300">R$ {value.toFixed(2)}</div>
      </div>
    </div>
  );
}
