// import * as PopoverPrimitive from "@radix-ui/react-popover"
// import {Popover,PopoverContent,PopoverClose,PopoverTrigger}from "@radix-ui/react-popover"
import { Ellipsis, X } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover"

export const SettingPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className=" h-auto w-auto p-2">
          <Ellipsis className=" mx-1 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-80" side={"right"} align={"start"}>
        {/* <PopoverClose asChild>
          <Button
            className=" h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600 bg-white"
            variant={"ghost"}>
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose> */}

        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
