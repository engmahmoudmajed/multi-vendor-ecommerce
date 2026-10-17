import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col gap-y-4 ">
          <div>
            <Button variant="elevated" className="border-black">I am button</Button>
          </div>
          <div>
            <Input placeholder="I am input"></Input>
          </div>
          <div>
            <Progress value={10}></Progress>
          </div>
          <div>
            <Textarea placeholder="Text Area"></Textarea>
          </div>
          <div>
            <Checkbox></Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
}
