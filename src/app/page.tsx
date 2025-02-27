import ExcelLoader from "./components/ExcelLoader";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leitura de Planilha XLSX</h1>
      <ExcelLoader />
    </div>
  );
}
