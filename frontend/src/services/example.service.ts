export class ExampleService {
  async getMessage(): Promise<{ message: string }> {
    const response = await fetch("/api/hello");
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }
}
