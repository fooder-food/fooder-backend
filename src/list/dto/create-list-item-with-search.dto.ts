import { CreateListItemDto } from "./create-list-item.dto";

export class CreateListItemWithSearchDto extends CreateListItemDto {
    keyword: string;
}