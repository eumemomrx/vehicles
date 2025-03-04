"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelLoader() {
  const [plateQuery, setPlateQuery] = useState<string>(""); // Placa digitada pelo usuário
  const [result, setResult] = useState<any>(null); // Resultado da busca
  const [loading, setLoading] = useState<boolean>(false); // Estado de carregamento

  // Função para carregar ambas as planilhas de uma vez
  const fetchExcel = async () => {
    try {
      setLoading(true);

      // URLs das planilhas
      const urls = [
        "https://docs.google.com/spreadsheets/d/1YC3_yHxOeeIh6CahktPTRIfVO1klIX_jEvf7xJt2Gb0/export?format=xlsx", // Planilha de Funcionários
        "https://docs.google.com/spreadsheets/d/1YC3_yHxOeeIh6CahktPTRIfVO1klIX_jEvf7xJt2Gb0/export?format=xlsx&gid=1706807251" // Planilha de Prestadores
      ];

      let allData: any = {};

      for (let i = 0; i < urls.length; i++) {
        console.log(`Carregando planilha ${i}:`, urls[i]);

        const response = await fetch(urls[i]);
        const blob = await response.blob();
        const reader = new FileReader();

        const data = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              if (!e.target) throw new Error("Erro ao ler o arquivo.");
              const arrayBuffer = e.target.result as ArrayBuffer;
              const workbook = XLSX.read(new Uint8Array(arrayBuffer));

              // Pegamos a primeira aba da planilha
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];

              // Converte a planilha em JSON
              const jsonData = XLSX.utils.sheet_to_json(sheet);
              resolve(jsonData);
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsArrayBuffer(blob);
        });

        allData[i] = data;
      }

      console.log("Dados carregados:", allData);
      setLoading(false);
      return allData;
    } catch (error) {
      console.error("Erro ao carregar as planilhas:", error);
      setLoading(false);
    }
  };

  const handlePlateSearch = async () => {
    setResult(null);
    setLoading(true);

    try {
      // Carrega TODAS as planilhas de uma vez
      const dataSheets: any = await fetchExcel();

      // 1. Buscar na planilha de funcionários (0)
      const dataFuncionarios = dataSheets[0] || [];
      const foundFuncionario = dataFuncionarios.find((row: any) => row["Placa"] === plateQuery);

      if (foundFuncionario) {
        setResult({
          Tipo: "Funcionário",
          Nome: foundFuncionario["Nome"],
          Setor: foundFuncionario["Setor"],
          Placa: foundFuncionario["Placa"],
          "Fabricante e Modelo": foundFuncionario["Fabricante e Modelo"],
        });
        setLoading(false);
        return;
      }

      // 2. Buscar na planilha de prestadores (1)
      const dataPrestadores = dataSheets[1] || [];
      const foundPrestador = dataPrestadores.find((row: any) => row["Placa"] === plateQuery);

      if (foundPrestador) {
        setResult({
          Tipo: "Prestador",
          Motorista: foundPrestador["Motorista"],
          Empresa: foundPrestador["Empresa"],
          Placa: foundPrestador["Placa"],
          Responsável: foundPrestador["Funcionário responsável"],
        });
        setLoading(false);
        return;
      }

      // 3. Caso não encontre
      setResult(null);
      setLoading(false);
    } catch (error) {
      console.error("Erro na busca:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Digite a placa"
          value={plateQuery}
          onChange={(e) => setPlateQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handlePlateSearch}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {/* Exibição do resultado */}
      {loading && <p className="mt-4 text-blue-500">Carregando...</p>}

      {result ? (
        <pre className="mt-4 p-2 bg-gray-100 rounded-md overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        !loading && <p className="mt-4 text-red-500">Placa não encontrada</p>
      )}
    </div>
  );
}
