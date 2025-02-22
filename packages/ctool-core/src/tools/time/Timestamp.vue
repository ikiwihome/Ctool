<template>
    <Align direction="vertical">
        <Select
            size="large"
            width="100%"
            :center="false"
            :label="$t('time_timezone')"
            v-model="action.current.timezone"
            :options="timezoneLists"
            @change="(value)=>action.current.timezone = value"
        />
        <Display position="right-center">
            <Input
                size="large"
                v-model="action.current.input"
                :label="$t('main_ui_input')"
                :placeholder="$t('time_timestamp_input_placeholder')"
            />
            <template #extra>
                <Align>
                    <Select
                        v-if="output.type === InputType.unix"
                        v-model="action.current.format"
                        size="small"
                        :options="[
                        {
                            value:`auto`,
                            label:`${$t('time_unix_auto')}:${$t(`time_unix_${output.autoFormat}`)}`
                        },
                        {value:Format.second,label:$t('time_unix_second')},
                        {value:Format.millisecond,label:$t('time_unix_millisecond')},
                        {value:Format.nanosecond,label:$t('time_unix_nanosecond')},
                    ]"
                    />
                    <Button
                        v-if="action.current.input !== ''"
                        :text="$t(`main_ui_clear`)"
                        @click="action.current.input = ''"
                        size="small"
                    />
                </Align>
            </template>
        </Display>
        <Display position="right-center" :text="output.isValid ? $t(`main_ui_copy`) : ''" @click="()=>$copy(output.second)">
            <Input readonly size="large" :model-value="output.second" :label="$t(`time_second`)"/>
        </Display>
        <div v-row="`1-1`">
            <Display position="right-center" :text="output.isValid ? $t(`main_ui_copy`) : ''" @click="()=>$copy(output.millisecond)">
                <Input readonly size="large" :model-value="output.millisecond" :label="$t(`time_millisecond`)"/>
            </Display>
            <Display position="right-center" :text="output.isValid ? $t(`main_ui_copy`) : ''" @click="()=>$copy(output.nanosecond)">
                <Input readonly size="large" :model-value="output.nanosecond" :label="$t(`time_nanosecond`)"/>
            </Display>
        </div>
        <div>
            <Table
                :columns="[
                        {title:$t(`time_format`),key:`format`},
                        {title:$t(`time_value`),key:`value`},
                    ]"
                :lists="example"
                :action-width="100"
                border
            >
                <template #column="{row}">
                    <td>{{ row.format }}</td>
                    <td>
                        <Link @click="$copy(row.value)">{{ row.value }}</Link>
                    </td>
                </template>
                <template #default="{row}">
                    <Button :text="$t(`main_ui_load`)" @click="()=>action.current.input = `${row.value}`" :size="'small'"/>
                </template>
            </Table>
        </div>
    </Align>
</template>

<script lang="ts" setup>
import {useAction, initialize} from "@/store/action";
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import {onUnmounted, watch} from "vue"
import zhTimezone from "./timezone/zh_CN.json";
import enTimezone from "./timezone/en_US.json";
import {SelectOption} from "@/types";
import {Format, transform, InputType} from "./util/timestamp";

dayjs.extend(utc)
dayjs.extend(timezone)

const format = "auto" as (Format | "auto")

const action = useAction(await initialize({
        input: "",
        timezone: dayjs.tz.guess(),
        format
    },
    {
        paste: (str) => (new RegExp(/^\d+-\d+-\d+ \d+:\d+:\d+$/)).test(str) || (new RegExp(/^\d+-\d+-\d+ \d+:\d+:\d+\.\d+$/)).test(str) || (new RegExp(/^-?\d{5,}$/)).test(str)
    }
))

const output = $computed(() => {
    return transform((action.current.input || "").trim(), action.current.timezone, action.current.format)
})

watch(() => {
    return {
        data: action.current,
        is_valid: output.isValid,
        format: output.format
    }
}, ({is_valid}) => {
    if (is_valid) {
        action.save()
    }
}, {immediate: true, deep: true})

const timezoneLists: SelectOption = $computed(() => {
    return Object.entries($t('main_locale') === "zh_CN" ? zhTimezone : enTimezone).map(([key, value]) => {
        return {value: key, label: `${value}`}
    })
})

let current = $ref(dayjs().valueOf())
const currentTimer = setInterval(() => {
    current = dayjs().valueOf()
}, 100)
onUnmounted(() => {
    clearInterval(currentTimer);
})

const example = $computed(() => {
    const day = dayjs(current).tz(action.current.timezone)
    return [
        {format: $t('time_normal_second'), value: day.format('YYYY-MM-DD HH:mm:ss')},
        {format: $t('time_unix_second'), value: day.unix().toString()},
        {format: $t('time_normal_millisecond'), value: day.format('YYYY-MM-DD HH:mm:ss.SSS')},
        {format: $t('time_unix_millisecond'), value: day.valueOf().toString()},
    ]
})
</script>
