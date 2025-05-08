import { X } from "lucide-react";
import { Indicator } from "../../../schemas/indicator-schema";

interface TagIndicatorProps{
    indicator: Indicator;
    onSelect: ()=>void;
    onDelete: ()=>void;
}

const TagIndicator: React.FC<TagIndicatorProps> = ({
    indicator,
    onSelect,
    onDelete
}) => {
    return ( 
        <div className="relative group transition-all">
            <div
                onClick={onSelect}
                className={"px-2 flex items-center gap-2 cursor-pointer py-1 w-fit rounded-sm overflow-hidden text-sm whitespace-nowrap  bg-gray-200 text-gray-700"}
            >
                <span >{indicator.name}</span>
                {Object.entries(indicator.params).map(([key, val])=> (
                    <div className="flex items-center gap-1" key={indicator.name+indicator.id+key}>
                        <div className="h-2 w-2 rounded-full" style={{backgroundColor: val.color}}></div>
                        <span style={{color: val.color}}>{val.value}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={onDelete}
                className="hidden shadow-xs transition-all cursor-pointer h-full rounded-tl-full rounded-bl-full px-1 absolute right-0 top-0 group-hover:block bg-gray-200 text-gray-700"
            >
                <X size={20}/>
            </button>
        </div>
    );
}
 
export default TagIndicator;