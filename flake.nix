{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    systems.url = "github:nix-systems/default";
  };

  outputs = {
    nixpkgs,
    systems,
    ...
  }: let
    supportedSystems = import systems;
    forAllSystems = f: nixpkgs.lib.genAttrs supportedSystems (system: f system);
  in {
    formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.alejandra);

    devShells = forAllSystems (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      default = pkgs.mkShell {
        packages = [
          pkgs.nodejs_20
          pkgs.pnpm
          pkgs.deno
        ];

        env = {
          PNPM_NO_UPDATE_NOTIFIER = "1";
          npm_config_fund = "false";
        };
      };
    });
  };
}
