{
<<<<<<< HEAD
  description = "Roo Code development environment";
=======
  description = "Optima AI development environment";
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
  };

  outputs = { self, nixpkgs, ... }: let
    systems = [ "aarch64-darwin" "x86_64-linux" ];

    forAllSystems = nixpkgs.lib.genAttrs systems;

    mkDevShell = system: let
      pkgs = import nixpkgs { inherit system; };
    in pkgs.mkShell {
<<<<<<< HEAD
      name = "roo-code";
=======
      name = "optima-ai";
>>>>>>> 3cf26ac7f905eaeb8535f7a0a000137528dc6856
      
      packages = with pkgs; [
        zsh
        nodejs_18
        corepack_18
      ];

      shellHook = ''
        exec zsh
      '';
    };
  in {
    devShells = forAllSystems (system: {
      default = mkDevShell system;
    });
  };
}
