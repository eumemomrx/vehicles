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

        const response = await fetch(urls[i]);
        const blob = await response.blob();
        const reader = new FileReader();

        const data = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              if (!e.target) throw new Error("Erro ao ler o arquivo.");
              const arrayBuffer = e.target.result as ArrayBuffer;
              const workbook = XLSX.read(new Uint8Array(arrayBuffer));

              // Pega a primeira aba da planilha
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
          Veiculo: foundFuncionario["Fabricante e Modelo"],
          Placa: foundFuncionario["Placa"],
          Nome: foundFuncionario["Nome"],
          Setor: foundFuncionario["Setor"],
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
          Empresa: foundPrestador["Empresa"],
          Veiculo: foundPrestador["Fabricante e Modelo"],
          Placa: foundPrestador["Placa"],
          Motorista: foundPrestador["Motorista"],
          sResponsavel: foundPrestador["Setor responsável"],
          fResponsavel: foundPrestador["Funcionário responsável"],
          Status: foundPrestador["Situação"],
          Obs: foundPrestador["Ocorrências"],
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
    <div className="flex flex-col m-0 p-0 items-center text-cinza bg-branco">
      <div className="w-full">
        <form className="w-full m-0 py-4 px-8 gap-1 flex flex-col items-center justify-center bg-azul text-branco">
          <h1 className="text-3xl my-2 ">Consulta de veículos</h1>
          <div className="form">
            <label htmlFor="">Digite a placa </label>
            <input
              type="text"
              pattern="^[a-zA-Z]{3}.*" placeholder="Ex: XXX0000"
              maxLength={7}
              required
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value)}
              className="border-none rounded-[20px] m-1 p-[.7rem] text-[.75rem] bg-white w-[6rem] text-center text-cinza"
            />
            <button
              onClick={handlePlateSearch}
              disabled={loading}
              className="border-none rounded-[20px] m-1 p-[.7rem] text-sm bg-cinza text-white font-semibold"
            >
              {loading ? "Buscando..." : "Consultar"}
            </button>
          </div>
        </form>
      </div>

      {/* Exibição do resultado */}
      {loading && <p className="mt-4 text-blue-500">Carregando...</p>}

      {result ? (
        result.Tipo === "Funcionário" ? (
          <div>
            <h1 className="m-4 text-center font-bold text-2xl">Funcionário</h1>
            <p><strong>Veiculo: </strong>{result.Veiculo}</p>
            <p><strong>Placa: </strong>{result.Placa}</p>
            <p><strong>Nome: </strong>{result.Nome}</p>
            <p><strong>Setor: </strong>{result.Setor}</p>
          </div>
        ) : (
          <div>
            <h1 className="m-4 text-center font-bold text-2xl">Prestador</h1>
            <p><strong>Empresa: </strong>{result.Empresa}</p>
            <p><strong>Veiculo: </strong>{result.Veiculo}</p>
            <p><strong>Placa: </strong>{result.Placa}</p>
            <p><strong>Nome do motorista: </strong>{result.Motorista}</p>
            <p><strong>Setor responsável: </strong>{result.sResponsavel}</p>
            <p><strong>Funcionário responsável: </strong>{result.fResponsavel}</p>
            <br/>
            <br/>
             {result.Status === "Inativo" ? <p className="text-red-500 text-center"><strong>Inativo</strong></p> : <p className="text-green-500 text-center"><strong>Ativo</strong></p>}
            
            {result.Obs ? (
              <p><strong>Ocorrências: </strong>{result.Obs}</p>
            ) : null}
          </div>
        )
      ) : !loading && plateQuery !== "" && result === null && (
        <p className="mt-4 text-red-500">Placa não encontrada</p>
      )}
    </div>
  );
}
