import { ChartLine, Upload } from "lucide-react";
import { useCsvStore } from "../../store/data-csv-store";
import Container from "../containers/Container";

const Header = () => {
    const {setCsv, csv} = useCsvStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
            setCsv({ name: file.name, content });
        }
        };
        reader.readAsText(file);
    };
    return ( 
        <header className="bg-white shadow-md">
            <Container className="flex px-4 py-4 justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-700">
                    <ChartLine size={24}/>
                    Plataforma de Backtesting
                </h1>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="file"
                            id="csvFile"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="csvFile"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-sm cursor-pointer flex gap-2 items-center whitespace-nowrap"
                        >
                            <Upload size={20}/>
                            {csv ? (
                                <span>{csv.name}</span>
                            ): (
                                <span>Cargar CSV</span>
                            )}
                        </label>
                    </div>
                </div>
            </Container>
        </header>
    );
}
 
export default Header;