"use client";

import { link } from "fs";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelLoader() {
  const [data, setData] = useState<any[]>([]);
  const [plateQuery, setPlateQuery] = useState<string>(""); // Variável para armazenar a placa consultada
  const [result, setResult] = useState<any>(null); // Armazenar o resultado da consulta

  const fetchExcel = async (pagPlanilha: number) => {
      try {
        var link: string = "";
        if(pagPlanilha === 0){
             link = "https://docs.google.com/spreadsheets/d/1YC3_yHxOeeIh6CahktPTRIfVO1klIX_jEvf7xJt2Gb0/edit?resourcekey=&gid=859141836#gid=859141836";
        } else if(pagPlanilha === 1){
             link = "https://docs.google.com/spreadsheets/d/1YC3_yHxOeeIh6CahktPTRIfVO1klIX_jEvf7xJt2Gb0/edit?resourcekey=&gid=1706807251#gid=1706807251"
        }
        console.log(link);
     const response = await fetch(link); // Insira o link correto para o arquivo .xlsx
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target) {
          console.error("Erro ao ler o arquivo: target é null");
          return;
        }
        const arrayBuffer = e.target.result as ArrayBuffer;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer));
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Use header: 0 para garantir que a primeira linha seja usada como cabeçalho
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Agora jsonData terá os dados com as primeiras linhas como chave
        setData(jsonData);
      };

      reader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Erro ao carregar a planilha:", error);
    }
  };

  const handlePlateSearch = () => {
    fetchExcel(1);
    // Filtra os dados com base na placa fornecida
    const found = data.find(row => row["D"] === plateQuery); // "F" é a coluna da Placa, ajusta se necessário

    if (found) {
      // Retorna apenas os campos relevantes
      const filteredResult = {
        Nome: found["B"], // Nome
        Setor: found["C"], // Setor
        Placa: found["F"], // Placa
        "Fabricante e Modelo": found["E"] // Fabricante e Modelo
      };
      setResult(filteredResult);
    } else {
      setResult(null); // Caso não encontre a placa
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
        >
          Consultar
        </button>
      </div>

      {/* Exibição do resultado */}
      {result ? (
        <pre className="mt-4 p-2 bg-gray-100 rounded-md overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <p className="mt-4 text-red-500">Placa não encontrada</p>
      )}
    </div>
  );
}
