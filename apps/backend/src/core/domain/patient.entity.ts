export class Patient {
  constructor(
    public readonly id: string,
    public readonly dni: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly photoUrl?: string,
  ) {}
}
