"use client";

import { useState } from "react";
import ParameterControls from "@/components/ParameterControls";
import { DEFAULT_PARAMETERS } from "@/lib/constants";

export default function TestPage() {
  const [params, setParams] = useState(DEFAULT_PARAMETERS);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ParameterControls Test</h1>
      <div className="max-w-md">
        <ParameterControls parameters={params} onChange={setParams} />
      </div>
    </div>
  );
}
