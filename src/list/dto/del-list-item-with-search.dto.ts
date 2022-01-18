import { CreateListItemDto } from "./create-list-item.dto";

export class DelListItemWithSearchDto extends CreateListItemDto {
    keyword: string;
}