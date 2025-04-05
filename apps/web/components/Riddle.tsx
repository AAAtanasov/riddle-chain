'use client';

import { useEffect, useState } from "react";

// TODO: contract configurable
const RIDDLE_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// TODO: consider types for the react component
export default function Riddle() {
    const [riddle, setRiddle] = useState<string>('');

}