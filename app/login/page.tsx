"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "../globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function ProfileForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [errorMessage, setError] = useState("");
  const [isSigning, setSigning] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(values.username.length==0 || values.password.length==0){
      setError("Password field is empty");
      return;
    }

    setSigning(true);

    try {
      const response = await fetch("https://directmechat.azurewebsites.net/api/login", {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json",
  
         },
         credentials:'include',
        body: JSON.stringify({ UserName: values.username, Password: values.password }),
      });

      if (response.status === 200) {
       
        
        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      } else if (response.status === 400) {
       
        let errorData = await response.json();
        throw new Error(errorData.message || "Bad Request");
      } else if(response.status === 500){
        setError("Please try again");
      }
      else if (response.status === 401) {
       
        setTimeout(() => {
          setError("Bad password");
          setSigning(false);
        }, 1000);
      }
        else if (response.status === 404) {
          
          setTimeout(() => {
            setError("User doesn't exist");
            setSigning(false);
          }, 1000);
      } else {
        setSigning(false);
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      setSigning(false);
      setError("An unexpected error occurred:" + (error as Error).message);
    }
  }

  return (
    <div
      className="flex justify-center items-center"
      style={{ backgroundColor: "black", height: "100vh" }}
    >
      <Card className="w-96 p-5 ">
        <CardTitle className="text-white flex-col justify-between mb-4">
        <div className="flex justify-between">
          Log In 
          {isSigning && <div>Logging In...</div>}
          </div>
          
        </CardTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Enter your username</FormLabel>
                  <FormControl className="text-white">
                    <Input type="username"  className="rounded-xl"  placeholder="Username" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Enter your password
                  </FormLabel>
                  <FormControl className="text-white">
                    <Input type="password"  className="rounded-xl"  placeholder="Password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button className="bg-white text-black hover:bg-gray-500 rounded-xl" type="submit">
                Log In
              </Button>
              <a
                href="/signup"
                className="text-white cursor-pointer justify-end"
                type="submit"
              >
                I don&apos;t have an account yet
              </a>
            </div>
            {errorMessage != "" && <h1 className="text-white">{errorMessage}</h1>}
            <div className="text-lg font-light">Please note that your first login might experience a delay due to Azure&apos;s cold start.</div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
