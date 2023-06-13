import {stringify} from "qs";
import {version} from "./util"
import {getCurrentLocale} from "@/i18n"
import platform from "./platform"
import {getUserUuid} from "@/store/user"

export const report = (data: Record<string, any> = {}) => {
    setTimeout(() => {
    }, 3000)
}
