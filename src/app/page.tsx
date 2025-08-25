
export default function Home() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-900 dark:text-neutral-100 text-center border border-neutral-200 dark:border-neutral-800">
      <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Controle de Contas</h1>
      <p className="text-neutral-700 dark:text-neutral-300">Escolha uma opção para começar:</p>
      <div className="flex justify-center gap-6 mt-8">
        <a
          href="/families"
          className="rounded bg-blue-600 px-6 py-3 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300"
        >
          Famílias
        </a>
        <a
          href="/bills"
          className="rounded bg-blue-600 px-6 py-3 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300"
        >
          Contas
        </a>
      </div>
    </div>
  );
}
